# Design page — test case catalog

Reference list of interaction scenarios for the Design page, kept alongside `DesignPage.ts` so
new e2e specs (or a reviewer checking coverage) can see what's expected without re-deriving it
from the implementation. "Unit" coverage refers to
`src/components/Design/Canvas/hooks/useSelectionTool/useSelectionTool.spec.tsx` (asserts
`store.getState()` directly, can express every branch precisely). "E2E" coverage can only assert
what's observable in the browser — DOM state (`aria-checked`) or canvas pixels (screenshot
diff/equality) — so it targets the highest-value real-integration paths, not every unit-level
branch.

## Contents

- [Auto-layout](./test-cases-auto-layout.md)
- [Draw (shape/tool creation)](./test-cases-draw.md)
- [Panels](./test-cases-panels.md)
- [Selection & manipulation](./test-cases-selection.md)
- [Text](./test-cases-text.md)
- [Vector](./test-cases-vector.md)
- [Tools](./test-cases-tools.md)

## Why so few scenarios get e2e coverage

Most of the branches above are two-line Redux-state assertions in the unit suite — an e2e
equivalent would need a screenshot diff standing in for `expect(selectedIds).toEqual(...)`, which
is slower and less precise (a screenshot proves _something_ changed, not _what_). E2E here is
reserved for the paths where the interesting part is the real browser + canvas + timing
interaction itself (paint timing, `pointerdown`/`pointerup` ordering) rather than the selection
algorithm's branch logic, which the unit suite already pins down exhaustively.
