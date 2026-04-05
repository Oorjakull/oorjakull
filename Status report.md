Status report

What I implemented now
1) Pose description updates (Section 2)
Updated reviewed introScript content for major Sanskrit-keyed poses in poseDescriptions.ts, including:

Pranamasana, Hasta Uttanasana, Tadasana, Ashwa Sanchalanasana
Virabhadrasana I (also pronunciation-safe wording: “Virabhadrasana 1”), Virabhadrasana II
Utkatasana, Trikonasana, Utthita Parsvakonasana, Prasarita Padottanasana, Uttanasana, Parsvottanasana, Goddess
Anjaneyasana, Ardha Hanumanasana, Parsva Balasana
Baddha Konasana, Janu Sirsasana, Paschimottanasana, Upavistha Konasana
Bhujangasana, Salamba Bhujangasana, Salabhasana, Setu Bandhasana, Ananda Balasana, Ustrasana
Down Dog and Adho Mukha Svanasana wording aligned
Examples are visible at:

poseDescriptions.ts:344
poseDescriptions.ts:350
poseDescriptions.ts:412
poseDescriptions.ts:657
Also updated Ustrasana benefits in the same file.

2) Safety / contraindication warnings (Section 6)
Added optional warnings field to PoseDescription:

poseDescriptions.ts:6
Populated warnings for:

malasana
Adho Mukha Svanasana (+ Down Dog)
Virabhadrasana I
Salabhasana
Setu Bandhasana
Supta Matsyendrasana
Ustrasana
Examples:

poseDescriptions.ts:363
poseDescriptions.ts:577
poseDescriptions.ts:658
And surfaced these warnings in intro UI:

PoseIntroOverlay.tsx:294
3) Sequence updates (Section 3)
Updated sequence order where feasible in sequences.ts:

surya-namaskar-beginner updated to right+left side flow structure (partial; see pending)
standing-strength reordered per review (right block + left block pattern)
gentle-morning now includes Parsva Balasana on both sides after Bitilasana
hip-opening reordered per review
core-balance significantly expanded to include Virabhadrasana III Prep, Virabhadrasana II, Trikonasana, Natarajasana Prep both sides
Entry points:

sequences.ts:22
sequences.ts:54
sequences.ts:86
sequences.ts:110
sequences.ts:132
4) Validation
No TS errors in changed files and build passes:


Full status report: implemented vs not yet
Implemented
Section 2: large set of corrected intro scripts (listed above), plus Ustrasana benefits.
Section 3: sequence restructuring for Standing Strength, Gentle Morning, Hip Opening, Core & Balance; Surya updated partially.
Section 6: contraindication warnings added to data + rendered in intro overlay.
Section 8: Virabhadrasana I pronunciation issue reduced by “Virabhadrasana 1” wording in script.
Not yet implemented
Section 1 (pose taxonomy/excel mapping updates): not yet.
Section 2: any pose text not part of this first implementation batch is still pending.
Section 3:
Surya Namaskar still missing Asthanga Namaskara exact step.
Per-step hold durations (10s/20s) not implemented yet.
Section 4 (image corrections): not implemented (asset pipeline work required).
Section 5 (AI feedback same-for-all issue): backend implementation completed (60% deterministic / 40% generic scoring, pose-specific violation grounding, prompt/evaluator wiring); live tests pending.
Section 8 phonetic pronunciation system (SSML/phoneme-grade control): not implemented yet.
TODO category (as requested: all 3 follow-ups)
Surya blocker follow-up

Add missing Asthanga Namaskara pose support end-to-end (description, reference, backend template/rules).
Per-step hold timings follow-up

Extend sequence step model with duration and wire timer/countdown/evaluation to sequence-specific hold time.
Pose category/labeling follow-up

Rework category model and UI grouping for labels like “Forward Bending”, “Restorative”, “Kneeling” alignment.