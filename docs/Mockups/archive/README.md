# Archive — superseded, do not build on

Kept for provenance only. Everything useful that was in here has been
replaced by `../illustrations/` and `../photos/`.

## The crop problem

Three of these four files share one root cause, worth recording because it
looks like a resolution problem and is not.

ChatGPT's image model caps at roughly **1536 px on the long edge**. Asked for
a sheet of sixteen assets, it produces one 1536 px canvas with sixteen panels
on it — about **380 px per asset**. Asking for "higher resolution" cannot fix
that, because the cap is on the canvas, not the subject. The fix is fewer
assets per canvas, not more pixels: one image per generation.

| File | Why it is here |
|---|---|
| `asset-library-contact-sheet.png` | The original 1536 × 1024 board, 16 assets in a grid. The source everything below was cut out of. Superseded by `../illustrations/` and `../photos/`. |
| `EIB_Quiz_Visual_Assets.pptx` | 18 slides. Each slide labels its own image as an *extracted crop* — `348 × 227px`, `320 × 198px`, and so on — cut from the contact sheet above. Nothing in it was ever generated at full size. |
| `EIB_Quiz_Visual_Asset_Library.pptx` | 17 slides, same crops, different layout. Media are 64–150 KB PNGs. |
| `EIB_Regeneration_Prompts.pptx` | 9 slides: the diagnosis above plus five copy-paste prompts, written to fix it. **Spent** — the prompts were run on 21 September 2026 and the results are in `../illustrations/`. |

## The one file with residual use

`EIB_Regeneration_Prompts.pptx` still holds working prompts. Two are worth
re-running if you want to finish the set:

- **Prompt 4 (Success / Achievement)** — regenerate with a female character if
  you prefer `study-woman-dog.png` over the male pair. Today there is no
  female success illustration, which is why the male pair is the only
  consistent set.
- **Prompt 3 (Germany map)** — only if you want a decorative map. Do not try
  to generate an *accurate* one; use `../photos/germany-states-accurate.svg`,
  which is correct, free, and vector.
