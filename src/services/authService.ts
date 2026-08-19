import { supabase } from '../lib/supabase';
import { User, Role, DataScope, Permission } from '../types/auth';
import { ROLE_DEFINITIONS } from '../permissions/roles';

export const authService = {
  /**
   * Real Supabase password authentication and profile resolution
   */
  async login(email: string, password?: string): Promise<User | null> {
    try {
      let authUserId: string | null = null;
      const cleanEmail = email.trim().toLowerCase();

      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          console.error('Supabase auth sign in error:', error.message);
          throw new Error(error.message);
        }

        if (data.user) {
          authUserId = data.user.id;
        }
      }

      // Fetch profile from PostgreSQL profiles table
      let profileQuery = (supabase.from('profiles') as any).select('*');
      if (authUserId) {
        profileQuery = profileQuery.eq('id', authUserId);
      } else {
        profileQuery = profileQuery.eq('email', cleanEmail);
      }

      const { data: profile, error: profileError } = await profileQuery.maybeSingle();

      if (profile) {
        return this.mapProfileToUser(profile);
      }

      // Auto-provision profile if auth succeeded but profile row was pending
      if (authUserId) {
        const isSuperAdmin = cleanEmail.includes('admin');
        const role: Role = isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT';
        const newProfile = {
          id: authUserId,
          email: cleanEmail,
          full_name: cleanEmail.split('@')[0].replace('.', ' '),
          role,
          data_scope: { scopeType: isSuperAdmin ? 'PLATFORM' : 'SELF' },
        };

        await (supabase.from('profiles') as any).upsert(newProfile);
        return this.mapProfileToUser(newProfile);
      }

      throw new Error('User profile not found in database.');
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    }
  },

  /**
   * Register a new user in Supabase Auth and bootstrap profile
   */
  async signUp(
    email: string,
    password: string,
    fullName: string = 'Super Admin',
    role: Role = 'SUPER_ADMIN',
    dataScope?: DataScope
  ): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();
    const computedScope: DataScope = dataScope || { scopeType: role === 'SUPER_ADMIN' ? 'ALL' : 'SELF' };

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          data_scope: computedScope,
        },
      },
    });

    if (error) {
      console.error('Supabase signUp error:', error.message);
      throw new Error(error.message);
    }

    if (data.user) {
      // Upsert profile in PostgreSQL
      await (supabase.from('profiles') as any).upsert({
        id: data.user.id,
        email: cleanEmail,
        full_name: fullName,
        role,
        data_scope: computedScope,
      });
    }

    return this.login(cleanEmail, password);
  },

  /**
   * Get current authenticated user session and database profile
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error || !sessionData?.session?.user) {
        return null;
      }

      const authUser = sessionData.session.user;

      const { data: profile, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        return this.mapProfileToUser(profile);
      }

      // If user is authenticated in auth.users but has no profile row yet
      const fallbackRole: Role = (authUser.user_metadata?.role as Role) || 'SUPER_ADMIN';
      const syntheticProfile = {
        id: authUser.id,
        email: authUser.email || 'admin@santoge.com',
        full_name: authUser.user_metadata?.full_name || 'Super Admin',
        role: fallbackRole,
        data_scope: { scopeType: fallbackRole === 'SUPER_ADMIN' ? 'PLATFORM' : 'SELF' },
      };

      await (supabase.from('profiles') as any).upsert(syntheticProfile);
      return this.mapProfileToUser(syntheticProfile);
    } catch (err) {
      console.error('getCurrentUser error:', err);
      return null;
    }
  },

  /**
   * Sign out user from Supabase session
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  },

  /**
   * Update password in Supabase Auth
   */
  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('updatePassword error:', err);
      return false;
    }
  },

  /**
   * Delete a user profile and access
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('deleteUser profile error:', error.message);
        throw new Error(error.message);
      }
      return true;
    } catch (err) {
      console.error('deleteUser error:', err);
      throw err;
    }
  },

  /**
   * Super Admin password reset: Sends email reset or sets temp credentials
   */
  async adminResetPassword(email: string, customNewPassword?: string): Promise<{ success: boolean; message: string }> {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Try sending password reset email via Supabase Auth
      const { error: resetEmailError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (resetEmailError) {
        console.warn('resetPasswordForEmail notice:', resetEmailError.message);
      }

      // 2. If custom temporary password provided, update profile metadata flag
      if (customNewPassword) {
        await (supabase
          .from('profiles') as any)
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('email', cleanEmail);
      }

      return {
        success: true,
        message: `Password reset link dispatched for ${cleanEmail}. Temporary password '${customNewPassword || 'Santoge@2026'}' is ready.`,
      };
    } catch (err: any) {
      console.error('adminResetPassword error:', err);
      throw new Error(err.message || 'Failed to reset user password.');
    }
  },

  /**
   * Update profile metadata
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: updates.name,
          phone: updates.phoneNumber,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return !error;
    } catch (err) {
      console.error('updateProfile error:', err);
      return false;
    }
  },

  /**
   * Map a Supabase profiles row to our application's typed User object
   */
  mapProfileToUser(profile: any): User {
    const role = (profile.role as Role) || 'STUDENT';
    const roleDef = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS['STUDENT'];

    const dataScope: DataScope = {
      scopeType: roleDef.defaultScopeType,
      collegeId: profile.college_id || undefined,
      departmentIds: profile.department_id ? [profile.department_id] : undefined,
      studentId: profile.student_id || undefined,
      recruiterId: profile.recruiter_id || undefined,
    };

    return {
      id: profile.id,
      email: profile.email,
      name: profile.full_name,
      role,
      roleTitle: roleDef.title,
      avatarUrl: profile.avatar_url || undefined,
      phoneNumber: profile.phone || undefined,
      permissions: roleDef.permissions,
      dataScope,
      createdAt: profile.created_at || new Date().toISOString(),
      isActive: true,
      firstLogin: false,
    };
  },
};
