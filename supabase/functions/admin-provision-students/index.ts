// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs in Supabase Edge Functions (Deno runtime).
// SUPABASE_SERVICE_ROLE_KEY is accessed ONLY server-side.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StudentProvisionItem {
  student_name: string;
  email: string;
  password?: string;
  roll_no?: string;
  dept?: string;
  course_1?: string;
  course_2?: string;
  course_3?: string;
  batch_id?: string;
  college?: string;
}

interface RequestBody {
  action: "provision" | "create_single" | "reset_password";
  students?: StudentProvisionItem[];
  student?: StudentProvisionItem;
  email?: string;
  auth_user_id?: string;
  new_password?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing server-side Supabase environment configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1. Verify caller JWT using standard client
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: callerUser },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !callerUser) {
      return new Response(JSON.stringify({ error: "Invalid or expired user session token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Admin verification against public.user_roles using service client
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: roleData, error: roleErr } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("auth_user_id", callerUser.id)
      .maybeSingle();

    if (roleErr || !roleData || !["admin", "super_admin"].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Super Admin or Admin privileges required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: RequestBody = await req.json();

    // -------------------------------------------------------------------------
    // ACTION: Reset Password
    // -------------------------------------------------------------------------
    if (body.action === "reset_password") {
      const email = body.email?.trim().toLowerCase();
      const newPassword = body.new_password?.trim();

      if (!newPassword || newPassword.length < 6) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 6 characters long" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      let targetAuthUserId: string | null = body.auth_user_id || null;

      // If auth_user_id not directly passed, look up from student_profiles by email
      if (!targetAuthUserId && email) {
        const { data: profData } = await adminClient
          .from("student_profiles")
          .select("auth_user_id")
          .eq("email", email)
          .maybeSingle();

        if (profData?.auth_user_id) {
          targetAuthUserId = profData.auth_user_id;
        }
      }

      if (!targetAuthUserId) {
        return new Response(
          JSON.stringify({
            error: `Could not locate active student record for ${email || "provided ID"}`,
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetAuthUserId, {
        password: newPassword,
      });

      if (updateErr) {
        return new Response(JSON.stringify({ error: updateErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          ok: true,
          message: `Password successfully updated for ${email || targetAuthUserId}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // -------------------------------------------------------------------------
    // Helper: Resolve Batch UUID (Strict - Never Auto-Creates Batch)
    // -------------------------------------------------------------------------
    async function resolveBatchUuid(
      identifier: string | undefined,
    ): Promise<{ ok: boolean; batchId?: string; error?: string }> {
      if (!identifier || !identifier.trim()) {
        return { ok: false, error: "Batch identifier is required" };
      }
      const raw = identifier.trim();

      if (UUID_REGEX.test(raw)) {
        const { data } = await adminClient.from("batches").select("id").eq("id", raw).maybeSingle();
        if (data?.id) return { ok: true, batchId: data.id };
      }

      const { data: byName } = await adminClient
        .from("batches")
        .select("id")
        .eq("name", raw)
        .maybeSingle();
      if (byName?.id) return { ok: true, batchId: byName.id };

      return {
        ok: false,
        error: `Batch "${raw}" not found. Please create the batch in the Batches tab first.`,
      };
    }

    // -------------------------------------------------------------------------
    // Helper: Provision a single student record
    // -------------------------------------------------------------------------
    async function provisionStudentRecord(
      item: StudentProvisionItem,
    ): Promise<{ ok: boolean; email: string; error?: string }> {
      const email = item.email?.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return { ok: false, email: email || "unknown", error: "Invalid email format" };
      }

      const name = item.student_name?.trim();
      if (!name) {
        return { ok: false, email, error: "Missing required student name" };
      }

      const rollNo = item.roll_no?.trim();
      if (!rollNo) {
        return { ok: false, email, error: "Missing required roll number" };
      }

      const dept = item.dept?.trim();
      if (!dept) {
        return { ok: false, email, error: "Missing required department" };
      }

      const password = item.password || "Temp@1234";
      const college = item.college?.trim() || "";
      const rawTracks = [item.course_1, item.course_2, item.course_3]
        .map((c) => c?.trim())
        .filter(Boolean) as string[];
      const tracks = rawTracks.slice(0, 3);

      // 1. Resolve Batch UUID strictly
      const batchResult = await resolveBatchUuid(item.batch_id);
      if (!batchResult.ok || !batchResult.batchId) {
        return { ok: false, email, error: batchResult.error || "Batch could not be resolved" };
      }
      const resolvedBatchId = batchResult.batchId;

      // 2. Create Supabase Auth user
      let authUserId: string | null = null;
      let isNewlyCreatedAuthUser = false;

      const { data: authCreated, error: createErr } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: "student",
          roll_no: rollNo,
          dept,
          batch_id: resolvedBatchId,
          college,
          tracks,
        },
      });

      if (authCreated?.user) {
        authUserId = authCreated.user.id;
        isNewlyCreatedAuthUser = true;
      } else if (createErr) {
        // Look up existing auth_user_id from student_profiles
        const { data: existingProf } = await adminClient
          .from("student_profiles")
          .select("auth_user_id")
          .eq("email", email)
          .maybeSingle();

        if (existingProf?.auth_user_id) {
          authUserId = existingProf.auth_user_id;
        } else {
          return { ok: false, email, error: createErr.message };
        }
      }

      // 3. Upsert into public.student_profiles
      const { data: profileData, error: profileErr } = await adminClient
        .from("student_profiles")
        .upsert(
          {
            ...(authUserId ? { auth_user_id: authUserId } : {}),
            name,
            email,
            roll_no: rollNo,
            dept,
            batch_id: resolvedBatchId,
            college,
            status: "active",
            xp: 0,
            streak: 0,
            placement_day: 1,
            talent_score: 0,
            readiness_t: 50,
            readiness_c: 50,
            readiness_a: 50,
            readiness_e: 50,
            readiness_r: 50,
            readiness_m: 50,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" },
        )
        .select("id")
        .single();

      if (profileErr) {
        // Rollback created Auth user if database insertion failed
        if (isNewlyCreatedAuthUser && authUserId) {
          await adminClient.auth.admin.deleteUser(authUserId);
        }
        return { ok: false, email, error: profileErr.message };
      }

      const studentId = profileData?.id;

      // 4. Assign technical tracks
      if (studentId && tracks.length > 0) {
        const { error: delTrackErr } = await adminClient
          .from("student_tracks")
          .delete()
          .eq("student_id", studentId);

        if (delTrackErr) {
          if (isNewlyCreatedAuthUser) {
            await adminClient.from("student_profiles").delete().eq("id", studentId);
            if (authUserId) {
              await adminClient.auth.admin.deleteUser(authUserId);
            }
          }
          return { ok: false, email, error: delTrackErr.message };
        }

        const trackRows = tracks.map((t, idx) => ({
          student_id: studentId,
          track_id: t,
          position: idx + 1,
        }));

        const { error: insTrackErr } = await adminClient.from("student_tracks").insert(trackRows);
        if (insTrackErr) {
          if (isNewlyCreatedAuthUser) {
            await adminClient.from("student_profiles").delete().eq("id", studentId);
            if (authUserId) {
              await adminClient.auth.admin.deleteUser(authUserId);
            }
          }
          return { ok: false, email, error: insTrackErr.message };
        }
      }

      return { ok: true, email };
    }

    // -------------------------------------------------------------------------
    // ACTION: Create Single Student or Bulk Provision
    // -------------------------------------------------------------------------
    const studentsToProcess: StudentProvisionItem[] =
      body.action === "create_single" && body.student
        ? [body.student]
        : Array.isArray(body.students)
          ? body.students
          : [];

    if (studentsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ error: "No student records provided for provisioning" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const results: Array<{ email: string; ok: boolean; error?: string }> = [];
    let successCount = 0;
    let failedCount = 0;

    for (const item of studentsToProcess) {
      const res = await provisionStudentRecord(item);
      results.push(res);
      if (res.ok) {
        successCount += 1;
      } else {
        failedCount += 1;
      }
    }

    return new Response(
      JSON.stringify({
        ok: failedCount === 0,
        count: successCount,
        failedCount,
        results,
        message: `Processed ${studentsToProcess.length} learners: ${successCount} successful, ${failedCount} failed.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
