# scripts/generate_placement_file.py
import json
import os
import sys

def format_ts_file(course_id: str, const_name: str, days: list) -> str:
    lines = [
        "/**",
        f" * SantoGe Talent Cloud — 90-Day Placement Accelerator Curriculum for {course_id.upper()}",
        f" * Course Code: {course_id}",
        " * 90 Days, 270 Placement Activities (Communication + Aptitude + Analytical Logic)",
        " */",
        "",
        'import type { CoursePlacementCurriculum } from "./types";',
        'import { buildPlacementDay } from "./builders";',
        "",
        f"export const {const_name}: CoursePlacementCurriculum = {{",
    ]

    for d in days:
        day_num = d["day"]
        lines.append(f"  {day_num}: buildPlacementDay(\"{course_id}\", {{")
        lines.append(f"    day: {day_num},")
        lines.append(f"    commType: {json.dumps(d['commType'])},")
        lines.append(f"    commTitle: {json.dumps(d['commTitle'])},")
        lines.append(f"    commScenario: {json.dumps(d['commScenario'])},")
        lines.append(f"    commPrompt: {json.dumps(d['commPrompt'])},")
        lines.append(f"    commVocab: {json.dumps(d['commVocab'])},")
        lines.append(f"    commRule: {json.dumps(d['commRule'])},")
        lines.append(f"    commWeakResponse: {json.dumps(d['commWeakResponse'])},")
        lines.append(f"    commWeakCritique: {json.dumps(d['commWeakCritique'])},")
        lines.append(f"    commStrongResponse: {json.dumps(d['commStrongResponse'])},")
        lines.append(f"    commStrongCritique: {json.dumps(d['commStrongCritique'])},")
        lines.append(f"    commCoachTip: {json.dumps(d['commCoachTip'])},")
        lines.append(f"    aptTopic: {json.dumps(d['aptTopic'])},")
        lines.append(f"    aptTitle: {json.dumps(d['aptTitle'])},")
        lines.append(f"    aptQuestion: {json.dumps(d['aptQuestion'])},")
        lines.append(f"    aptOptions: {json.dumps(d['aptOptions'])},")
        lines.append(f"    aptAnswer: {d['aptAnswer']},")
        lines.append(f"    aptExplanation: {json.dumps(d['aptExplanation'])},")
        lines.append(f"    aptFormula: {json.dumps(d['aptFormula'])},")
        lines.append(f"    logicType: {json.dumps(d['logicType'])},")
        lines.append(f"    logicTitle: {json.dumps(d['logicTitle'])},")
        lines.append(f"    logicQuestion: {json.dumps(d['logicQuestion'])},")
        lines.append(f"    logicOptions: {json.dumps(d['logicOptions'])},")
        lines.append(f"    logicAnswer: {d['logicAnswer']},")
        lines.append(f"    logicExplanation: {json.dumps(d['logicExplanation'])},")
        lines.append("  }),")

    lines.append("};")
    lines.append("")
    return "\n".join(lines)

print("generate_placement_file helper ready.")
