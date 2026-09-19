# Legacy (May 28 build) — not production, do not publish from here

Kept for reference only. Production is `/index.html` + `/questions.json`.

- `einbuergerungstest-berlin.html` — May 28 standalone source file.
- `questions-final-extended.json` — **contains corrupted question data.** Do not use.
- `regen_questions.js` — copies that JSON into HTML. Do not run until the JSON is repaired.

To regenerate question data, use `tools/extract-questions.js`, then `node tools/validate.js`.
