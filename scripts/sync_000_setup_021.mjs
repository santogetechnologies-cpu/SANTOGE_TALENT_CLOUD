import * as fs from "fs";

const fullSetupPath = "supabase/000_FULL_SETUP.sql";
const mig021Path = "supabase/migrations/021_secure_student_skill_completion.sql";

const fullSetup = fs.readFileSync(fullSetupPath, "utf8");
const mig021 = fs.readFileSync(mig021Path, "utf8");

const separator = `\n\n-- ============================================================================\n-- APPENDED: Migration 021 (Security Fix #3 - Authoritative Curriculum Skill Validation)\n-- ============================================================================\n\n`;

fs.writeFileSync(fullSetupPath, fullSetup.trim() + separator + mig021.trim() + "\n");
console.log("Synchronized 000_FULL_SETUP.sql with migration 021!");
