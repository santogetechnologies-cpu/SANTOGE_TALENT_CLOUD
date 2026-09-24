import { TRACKS } from "../src/lib/tracks.ts";
import { modulesFor, skillsFor } from "../src/lib/curriculum.ts";

for (const t of TRACKS) {
  const skills = skillsFor(t.id);
  console.log(`Track: ${t.id} (${t.name}) -> ${skills.length} skills:`);
  for (const s of skills) {
    console.log(`  - ${s.id}: ${s.name}`);
  }
}
