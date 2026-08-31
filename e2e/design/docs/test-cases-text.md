# Text — test case catalog

Test cases for text creation/editing, Text on Path, and Text on Vector that live in `e2e/design/text/`.

## Double-click to edit an existing text node (Etap 10)

Editing was previously only reachable while a text box was being freshly drawn — there was no path
from an already-placed `TTextNode` back into `contentEditable` edit mode at all (`editingTextBox`
carried no node identity, so `useCommitTextEdit.ts` always called `addNode`, never `updateNode`).
Figma's own behavior: double-clicking a text node — selected or not — enters edit mode with its
entire existing content selected, so typing immediately replaces it. `editingTextBox`/
`editingTextContent` gained a sibling `editingNodeId` (`store/design/types.ts`), set by a new
`useTextEditOnDoubleClick.ts` hook (a plain `dblclick` listener, gated on the default tool) that
hit-tests via `getDoubleClickedTextNode.ts`, a thin wrapper over the ordinary `getNodeAtPoint.ts`.

**Later fix — `getDoubleClickedTextNode.ts` originally also fell back to `isPointInSelectedTextBounds.ts`
(the same "precise glyph hit, or full box if already the sole selection" layering `handlePointerDown.ts`
uses for dragging)**, so double-clicking anywhere in an already-selected text's fixed box — even well
past its rendered content — entered edit mode. Reported live as worse than the equivalent vector-selection
bug further below ("Vector node selection (Move tool)"): unlike a plain click, this one visibly _does_
something (spawns the edit overlay) even over empty space. Fixed by dropping the bounds fallback entirely — entering
edit mode now always requires actually hitting the rendered glyphs, selected or not, matching every other
double-click case in this section (#58, #157 below). `isPointInSelectedTextBounds.ts` itself is
untouched and still backs the _drag_ fallback (`armSelectedTextBoundsOnPointerDown.ts`, #38-#41 above) —
only entering edit mode tightened, not moving an already-selected box.

**Second later fix — the drag fallback itself (`armSelectedTextBoundsOnPointerDown.ts`) got the same
`pendingClickAction: 'deselect'` treatment as its vector equivalent** (§"Vector node selection (Move
tool)" below): it now arms via `armGroupBoundsDrag.ts` instead of a plain `armHitDrag.ts` call, so a
plain click (no drag) landing inside a selected text's fixed box but past its rendered content
deselects it on release, exactly matching a gap click — a real drag still moves it, unaffected. This
also means each half of a `dblclick` on such a point deselects on its own now; #59 below only proves
no edit overlay ever briefly appears in between (compared against an identical single-click reference,
not the pre-click "selected" screenshot, since that screenshot itself changes once the click lands).
`TextEditOverlay.tsx` seeds the `contentEditable` div's
initial DOM content from the node's existing `content` (`setEditableTextContent.ts`, the inverse of
the existing `getEditableTextContent.ts`) and selects all of it via `window.getSelection()`/`Range`
(`selectEditableTextContent.ts`) — both only run once per edit session, gated on `box`/
`editingNodeId` identity via a ref snapshot, not on every keystroke's `editingTextContent` update
(`useSeedEditableTextOnEntry.ts`). `useCommitTextEdit.ts` now branches on `editingNodeId`:
`updateNode({ changes: { content } })` for an existing node instead of `addNode`. Clearing all
content on an existing node and blurring used to just discard the edit, leaving the node's original
content untouched (this codebase had no delete-node action at all) — since requested explicitly as a
UX fix: an existing node emptied out should disappear entirely, the same way a freshly-drawn box
with nothing typed already never gets created (#36 above). A new `deleteNode` reducer
(`store/design/slice.ts` + `handleDeleteNode.ts`) removes the id from `nodes`/`rootOrder`/
`selectedIds`; `useCommitTextEdit.ts` dispatches it instead of doing nothing whenever
`content.length === 0 && editingNodeId`. Text-on-path needed one more step: a path-bound `TTextNode`
is never independently useful without its text (the path node has no click/hover surface of its own
— `getNodeAtPoint.ts`'s `NodeType.path → false` branch — and is always created 1:1 alongside its
text, see the Text on Path section above), so `handleDeleteNode` recurses onto `node.pathId` when
deleting a text node that has one, cascading the path node's own deletion rather than leaving an
orphaned, permanently-unreachable entry behind in `nodes`/`rootOrder`.
While a node is being edited, `drawScene.ts` filters it out of the normal fill/selection/hover
render passes by id, so the live `contentEditable` overlay and its own `drawEditingText.ts` outline
are the only representation on screen — otherwise the stale static glyphs would render underneath
the live-typed ones.

| #   | Scenario                                                                                                                                         | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :-----------------------: |
| 58  | Double-clicking an unselected text node enters edit mode with all its content selected, so typing replaces it instead of appending               |  ✅  |  ✅ `edit-text.spec.ts`   |
| 157 | Re-entering edit mode on a multi-line text node selects all of its content, not just the line/word under the double-click point                  |  ✅  |  ✅ `edit-text.spec.ts`   |
| 59  | Double-clicking a selected text node past its rendered content (but inside its fixed box) does not enter edit mode                               |  ✅  |  ✅ `edit-text.spec.ts`   |
| 286 | A plain click (no drag) on an already-selected text node, landing past its own rendered content, deselects it — same as missing the box entirely |  ✅  |  ✅ `edit-text.spec.ts`   |
| 60  | Blurring an existing-node edit updates that node's content in place, never adds a duplicate node                                                 |  ✅  |             —             |
| 61  | Clearing all content on an existing node and blurring deletes that node, matching a freshly-drawn empty box never being created                  |  ✅  |  ✅ `edit-text.spec.ts`   |
| 105 | Clearing all content on an existing text-on-path node and blurring deletes both the text node and its bound path node, not just the text         |  ✅  | ✅ `text-on-path.spec.ts` |
| 62  | The node currently being edited is excluded from normal fill, selection-outline, and hover-outline rendering                                     |  ✅  |             —             |
| 63  | A rotated, mirrored node being edited keeps rendering its glyphs (`drawEditingText.ts`) at its own rotation/flip                                 |  ✅  |  ✅ `edit-text.spec.ts`   |
| 64  | The canvas-drawn selection highlight/caret (`drawEditingCaretAndSelection.ts`) reacts to the live selection, even on a rotated node              |  ✅  |  ✅ `edit-text.spec.ts`   |
| 86  | Clicking a point on a rotated or flipped straight-text box places the caret there, not wherever native (unrotated) DOM hit-testing would land    |  ✅  |  ✅ `edit-text.spec.ts`   |
| 91  | Clicking a point on a plain (unrotated, unflipped) straight-text box places the caret there too, instead of exiting edit mode entirely           |  ✅  |  ✅ `edit-text.spec.ts`   |
| 92  | Double-clicking a word while actively composing straight text selects that word, so typing replaces it instead of colliding with the caret       |  ✅  |  ✅ `edit-text.spec.ts`   |
| 93  | Double-clicking a word inside a live, unsaved re-edit does not fall back to `useTextEditOnDoubleClick.ts`'s stale hit-test and discard it        |  ✅  |  ✅ `edit-text.spec.ts`   |

#61/#105's unit coverage (`useCommitTextEdit.spec.tsx`, `handleDeleteNode.spec.ts`) already asserts
`store.getState().design.nodes`/`rootOrder` exactly, including the path-node cascade specifically —
but each also gets an e2e proof that the node's real, rendered presence on the canvas actually
disappears after a genuine double-click → native `Backspace` → blur sequence, the same "real browser

- rendering" category the rest of this file is for. Both compare the cleared result against the
  already-established "drawn, then discarded with no content typed" reference (#36's plain-text case,
  its own text-on-path equivalent here) rather than a totally untouched page — the shared text/
  text-on-path toolbar button remembers whichever tool was used last (`lastTextTool`, same mechanic as
  `lastShapeTool`), so a page that touched Text on Path always renders that button differently from one
  that never did, regardless of whether the node itself survived; comparing against a fresh page would
  have flagged that unrelated toolbar-memory difference as if it were the bug under test. #105's own
  e2e version can only prove the _overall_ disappearance, not specifically that the path node (as
  opposed to just its text) was the thing deleted — a path node has no independent click/hover surface
  of its own, so an orphaned-but-undeleted path would render identically invisible to a genuinely
  cascaded one; only `handleDeleteNode.spec.ts`'s direct `state.nodes` assertion can actually
  distinguish the two, which is why the cascade specifically stays unit-proven even though the
  top-level scenario also has an e2e test.

#58/#59 are the two distinct hit-test branches (`getDoubleClickedTextNode.ts` already pins both
precisely via `store.getState()`), but the actual claim worth an e2e proof is a real native
`dblclick`, a real `window.getSelection()`/`Range` call against a real `contentEditable` div, and a
real subsequent `page.keyboard.type` — proving the browser's own selection/typing behavior
(replace-selected-text) actually fires, not just that the app _asked_ it to. Both assert by
comparing against a from-scratch reference render of the final text at the same position/box:
pixel equality can only hold if the edit both replaced (not appended) and updated in place (not
duplicated), so this single screenshot comparison covers #58-#60 together without a separate
mechanism for #60. #60/#62 stay unit-only — each is a precise `store.getState()`/mocked-`gl` call-count
assertion (`useCommitTextEdit.spec.tsx`, `drawScene.spec.ts`) that a screenshot diff wouldn't
meaningfully improve on, per the "why so few scenarios get e2e coverage" rationale below. #61 gets
its own e2e test now too, per the note above.

#63/#64 are exactly the bug a `jsdom` unit test can paper over: `TextEditOverlay.spec.tsx` can only
assert the DOM overlay's own inline style (e.g. that no `transform` is set), never that the
_visible_ glyphs/highlight the browser actually paints on the WebGL canvas stay aligned with a
rotated node — the DOM overlay is deliberately invisible (`color`/`caretColor`/`::selection` all
transparent) precisely because its own native text layout doesn't kern-match the MSDF glyph layout,
so the real proof has to look at rendered canvas pixels. #63's e2e version rotates a real node via a
real rotate-ring drag (the same interaction as `rotate.spec.ts`), enters edit mode, and asserts the
resulting canvas screenshot differs from editing an otherwise-identical unrotated node — pre-fix,
`drawEditingText.ts` hardcoded `rotation: 0`, so the two would have rendered indistinguishably. #64
goes a step further on the same rotated node: it asserts the canvas-drawn selection highlight
(`getSelectionRects.ts`) actually disappears once `ArrowRight` collapses the selection to a caret —
proving the highlight is driven by live selection state, not just a static rotated decoration, and
that this now works correctly even when rotated (pre-fix, the equivalent native DOM highlight would
render axis-aligned and visibly detached from the rotated glyphs, per the original bug report).

#86 was a known, previously-deferred gap (`docs/ROADMAP.md`): a click _inside_ an already-open edit
session used to always fall through to the browser's own native `contentEditable` hit-testing, which
places the Range against the overlay div's unrotated, unflipped native text layout — correct only
when the box's own `rotation`/`flipX`/`flipY` are all identity. For a rotated or flipped box, the
same screen point maps to a different character than the one visually under the cursor (worst case,
a 180-degree box reads back-to-front, so a click near what looks like the end of the text lands the
caret near the start instead). `useStraightCaretEditing.ts` (originally `useRotatedCaretEditing.ts` —
renamed for #91 below, see that entry for why "rotated" stopped being the right scope) fixes this the
same way `useCurvedCaretEditing.ts` already fixed the equivalent bug for path text: a real
`document`-level `pointerdown`/`pointermove`/`pointerup` listener computes the clicked character via
`getStraightCaretIndexAtPoint.ts` — unrotate then unflip the query point (`rotatePoint`/
`flipTextPoint`, the same inverse-transform trick `getUnrotatedQueryPoint` already uses for
hit-testing elsewhere), then walk `wrapTextWithOffsets`/`measureGlyphTextWidth` to find the nearest
character boundary — and programmatically sets the real DOM `Range`/`Selection` via
`setEditableSelectionRange.ts`, overriding whatever the native click would have done.
`useSelectionTool.ts`'s own pointer handling is gated off by `shouldUseCanvasCaretEditing.ts` while
either canvas-driven caret-editing hook is active, so a click that lands on the bare canvas (rather
than the overlay) during such a session can't also select/drag some other node underneath. The unit
suite (`getStraightCaretIndexAtPoint.spec.ts`, `shouldUseCanvasCaretEditing
.spec.ts`, `useStraightCaretEditing.spec.tsx`) asserts the exact index/distance/selection precisely
in jsdom, but the e2e version proves a real rotate-ring drag to an exact 180 degrees (dragging to the
reflection of the arm point through the box's own center, guaranteeing the delta regardless of the
arm point's exact position) followed by a real click at two different points on the now-upside-down
text produces two visibly different results for the same typed character — the same "compare two
independently-drawn pages" pattern `text-on-path.spec.ts`'s curved-caret tests already use.

#91 is a real, reported regression, found right after #86 shipped: `TextEditOverlay.module.scss`
sets `pointer-events: none` on the editing overlay (added earlier, to stop resize/rotate/path-offset
hover cursors from bleeding through while text is being edited), which means the overlay itself can
**never** receive a click at all, rotated or not — every click always falls straight through to the
`<canvas>` underneath. #86's own fix already accounted for this correctly for rotated/flipped/path
boxes (routing them through a canvas-level listener instead of relying on native hit-testing), but
`isBoxRotatedOrFlipped`'s gate deliberately left plain (rotation 0, no flip) boxes out, on the
stale assumption from before the `pointer-events: none` change that "native still handles the plain
case" — it never did, once that change landed. So for a plain box specifically, a click meant to
reposition the caret instead fell through to `useSelectionTool.ts`'s still-active canvas listener,
which never calls `preventDefault()` — letting the browser's own default mousedown action fire
unopposed, blurring the overlay and committing/exiting the edit session entirely, exactly the "select
a cursor position and it immediately kicks you out of the tool" behavior reported live. Renamed
`useRotatedCaretEditing.ts` → `useStraightCaretEditing.ts` and widened its gate (and
`shouldUseCanvasCaretEditing.ts`'s) to cover every straight (non-path) box being edited, not just
rotated/flipped ones — `getStraightCaretIndexAtPoint.ts`'s inverse-transform math already degrades
correctly to identity at `rotation: 0`/no flip, so no new math was needed, only the activation
condition. Fixing this exposed a second, previously-hidden bug in the same area: `useSelectionTool.ts`
being active throughout a plain-text edit was also silently responsible for **deselecting** the node
once its own empty-canvas-click handler ran on the same click that caused the native blur — with
`useSelectionTool.ts` now correctly disabled for the whole edit session (any rotation), that dedicated
deselect-on-commit behavior had to move into `useCommitTextEdit.ts` itself (`dispatch(setSelection([]))`
unconditionally alongside `stopTextEdit()`), rather than continuing to rely on an unrelated hook's
side effect — caught by two existing screenshot tests (#58/#59 above) that started failing once
`useSelectionTool.ts` stopped incidentally doing this. #91's own e2e version mirrors #86's exact
pattern for a never-rotated box: click a point between two rendered characters vs. just past them,
type the same character, and assert the two independently-drawn results differ — proving both that
the click landed inside the edit session (not exiting it) and that it landed at the right character.

#92 is a real, reported regression found right after #91 shipped: the same `handlePointerDown`
routine that #86/#91 route through to place a collapsed caret always collapsed to a single index,
with no notion of "this is actually a double-click" — so double-clicking a word to select it (the
browser's own native gesture) got silently overridden into a plain caret placement, for every
editing session (straight or curved, any rotation), since `pointer-events: none` means the browser
never sees the click on the overlay either way and can't run its own native word-select. Fixed with
a new shared `getWordRangeAtIndex.ts` (pure string-index math — walks outward from the clicked
boundary while the adjacent characters stay on the same side of a `\S` word/non-word split) plus a
dedicated `dblclick` listener in both `useStraightCaretEditing.ts` and `useCurvedCaretEditing.ts`
(`handleDoubleClick.ts` in each hook's own `utils/`, alongside the existing `handlePointerDown`/
`handlePointerMove`/`handlePointerUp` split — `useStraightCaretEditing.ts` itself got the same
promotion `useCurvedCaretEditing.ts` already had, since it grew past the "trivial single hook file"
threshold once double-click joined single-click/drag/release as a fourth listener) — the two
preceding `pointerdown`s that make up a double-click still each collapse the selection once, but the
browser's own native `dblclick` recognition fires last and this handler's word-range selection wins.
`getWordRangeAtIndex.spec.ts` pins the exact boundary math (mid-word, at a word/whitespace edge, past
the content length, degenerate empty content) precisely; the e2e version proves the same "compare two
independently-drawn pages" claim as #86/#91 — double-click a word mid-composition, retype it, and
assert the result matches a reference typed directly, meaning the double-click genuinely replaced
just that word rather than colliding with (or being silently eaten by) the caret-placement path.

#93 is a second, deeper regression uncovered while verifying #92: `useTextEditOnDoubleClick.ts` (the
hook that starts an edit session on double-click, #58/#59 above) has always been gated purely on
`activeTool === default`, never on whether an edit session is already live — so a double-click meant
to select a word _inside_ an active, unsaved re-edit also reached this hook's own canvas-level
`dblclick` listener, which hit-tests against the node's stale, already-committed content in the store
(the live, in-progress content only exists in `editingTextContent`/the DOM overlay, not yet written
back via `updateNode`) and unconditionally dispatches a fresh `startTextEdit`, silently discarding
whatever had been typed since re-entering. Unreported until now because double-clicking mid-edit
previously did nothing useful (before #92) — this behavior existed, it just weren't yet something a
user had reason to trigger. Fixed by also gating `useTextEditOnDoubleClick.ts` on `!editingTextBox`.
The unit suite (`useTextEditOnDoubleClick.spec.tsx`) asserts the exact store state (`editingNodeId`/
`editingTextContent` unchanged) directly; the e2e version types content, re-selects a word inside it,
retypes, and checks the final result against a from-scratch reference — a stale reset would have
reverted to the original committed text partway through, producing a completely different final
render than what re-typing the same final content directly would produce.

## Escape while editing Text / Text on Path

Escape previously did nothing while editing at all: `useBlockShortcutPropagation.ts`'s blanket
`event.stopPropagation()` on every keydown meant the global Escape listener (`useToolbarShortcuts.ts`)
never even received the event, and nothing inside the overlay handled `Escape` itself. Requested
explicitly as a two-stage UX flow mirroring most design tools: the _first_ Escape while actively
editing commits the edit (same add/update/delete branching `useCommitTextEdit.ts` already had for a
normal blur — see the Double-click section above and the delete-on-empty section further up) and
leaves the resulting node **selected**, unlike an ordinary blur/click-away commit which always
deselects; a _second_ Escape (now just selected, not editing) deselects it via #106 above — two
presses total to go from "actively editing" to "fully deselected." A brand-new (never-before-existing)
box with content typed behaves like any other commit-and-select; a brand-new box with **no** content
discards on Escape exactly like it would on blur (nothing is created — matches #36's established
"empty box never created" behavior). Implemented via a `selectOnCommitRef` (`useRef(false)`, created
in `TextEditOverlay.tsx`, threaded into both `useBlockShortcutPropagation.ts` and
`useCommitTextEdit.ts`): pressing Escape sets the ref and calls `event.currentTarget.blur()`, letting
the _existing_ `onBlur` → `useCommitTextEdit` handler run unchanged, except it now reads the ref to
decide whether to select the committed node (`selectCommittedNode.ts`, a new util: dispatches
`setSelection([editingNodeId])` for an existing node, or reuses `selectLastCreatedNode.ts` — the same
util the shape tools use — to resolve a brand-new node's freshly-`nanoid()`-generated id) instead of
clearing the selection as a normal blur does. This reuses all the existing commit/delete branching
logic instead of duplicating it, and avoids any double-commit race: the ref is reset to `false`
inside the same handler invocation it's read from, so a later _native_ blur (unrelated to Escape)
never misreads a stale `true`.

| #   | Scenario                                                                                                                                | Unit |          E2E           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 107 | Escape while typing fresh text (or path-text) with content commits it and leaves it selected, unlike a plain blur which deselects       |  ✅  | ✅ `edit-text.spec.ts` |
| 108 | Escape while drawing a fresh text (or path-text) box with no content discards it, same as blurring it away empty                        |  ✅  | ✅ `edit-text.spec.ts` |
| 109 | Escape while re-editing an existing text (or path-text) node exits editing and selects it; a second Escape then deselects it (via #106) |  ✅  | ✅ `edit-text.spec.ts` |

All three get both layers of coverage for the same reason as the rest of this file: the unit suite
(`useCommitTextEdit.spec.tsx`, `useBlockShortcutPropagation.spec.tsx`, `selectCommittedNode.spec.ts`,
`TextEditOverlay.spec.tsx`) already asserts `store.getState().design.selectedIds`/`nodes`/`rootOrder`
exactly for every branch, but each also gets an e2e proof that the real rendered selection outline
actually appears/disappears after a genuine `keydown` — the same "real browser + rendering" category
the rest of this file is for. #107/#109's e2e versions compare against a manually-reconstructed
reference (commit via blur, then select via a real plain click) rather than asserting exact pixels
directly, the same "compare two independently-produced pages" pattern used throughout this file.
`text-on-path.spec.ts`'s own versions of #107/#108 had to compare against a "drawn, then
discarded/committed via blur" reference rather than a totally untouched page, for the same
`lastTextTool` toolbar-memory reason noted in the delete-on-empty section above — a page that
selected Text on Path always renders that shared toolbar button differently from one that never
touched the tool at all, regardless of the node's own final state. All of #107–#109's captures also
explicitly rest the pointer at a shared neutral point before every screenshot: Escape is a pure
keyboard event and never moves the mouse, so without this the hover outline (a rendering concern
fully independent of selection) would depend on wherever the previous gesture happened to leave the
pointer — the exact "Gotcha for other e2e tests" already documented under Hover highlight above,
re-encountered here for the same underlying reason.

## Text on Path (ellipse-only v1)

A self-contained sibling feature to the plain Text tool — not "Text drawn on top of an Ellipse
node that just looks connected." The Text on Path tool (`useDrawTextOnPathTool.ts`) draws its own
`NodeType.path` node (an ellipse-shaped curve for v1, `PathType.ellipse` — a new node type kept
deliberately separate from `NodeType.ellipse`/the Ellipse tool, never created or touched by it) the
same way `useDrawShapeTool` drags out a box, then immediately dispatches `startTextEdit` on it,
same "drop into edit mode right after drawing" convention as the plain Text tool. On commit, the
`TTextNode` gets `pathId = PathNode.id` — a real, separate node, genuinely bound, not merely
positioned to look connected. `handleUpdateNode.ts` runs a bidirectional sync cascade
(`syncPathTextNodes.ts`/`syncPathNodeFromText.ts`): resizing/rotating/moving either the path or its
bound text propagates to the other on every update (live during a drag, not just on release), so
the text always follows the path's actual current shape. The path node itself renders as a
stroke-only ellipse outline with no fill (`drawSceneNodes.ts`/`drawDraftShape.ts`'s `NodeType.path`
branches, reusing the generic `drawEllipse` primitive — not Ellipse-tool code). Glyph curving,
truncate-on-overflow, and the draggable start-offset handle were built in an earlier pass and are
unaffected by this node-model rework, since they always read the text node's own denormalized
box, never a separate node lookup.

| #   | Scenario                                                                                                                                                                                                                                               | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :-----------------------: |
| 74  | Drawing a path with the Text on Path tool, typing content, then clicking away commits a rendered curved text node bound to a real, separate path node                                                                                                  |  —   | ✅ `text-on-path.spec.ts` |
| 75  | Typing a tool-shortcut letter while editing text on a path does not switch the active tool (the focus-timing bug this feature originally shipped with — `useSeedEditableTextOnEntry.ts` grabs focus via `useLayoutEffect`, not a deferred `useEffect`) |  —   | ✅ `text-on-path.spec.ts` |
| 76  | Resizing the source path node updates the attached text's curve live, proving the two are a real bidirectional relation, not independently-positioned nodes                                                                                            |  ✅  | ✅ `text-on-path.spec.ts` |
| 77  | Dropping the overflowing tail of the content (instead of shrinking the font) so text never overlaps itself when longer than the path's circumference                                                                                                   |  ✅  |             —             |
| 78  | Dragging the blue start-offset handle moves where the text begins along the path                                                                                                                                                                       |  ✅  |             —             |
| 84  | Clicking a point along curved text (re-entered via double-click) places the caret at the nearest character index on the curve, so a typed character inserts there instead of always landing at the end                                                 |  ✅  | ✅ `text-on-path.spec.ts` |
| 85  | Dragging along the curve from one character to another selects that range; typing replaces the selection instead of inserting alongside it                                                                                                             |  ✅  | ✅ `text-on-path.spec.ts` |
| 87  | Clicking a point on a rotated (or flipped) path-text circle places the caret at its actual rotated/flipped screen position, not the position it would occupy at rotation 0                                                                             |  ✅  | ✅ `text-on-path.spec.ts` |
| 90  | Committing a freshly typed path-text node without ever having explicitly selected it does not leave a stale resize-handle hit zone active at the underlying path node's own corner                                                                     |  ✅  | ✅ `text-on-path.spec.ts` |
| 94  | Double-clicking a word while actively composing path-text selects that word (via `useCurvedCaretEditing.ts`'s own `handleDoubleClick.ts`, sharing `getWordRangeAtIndex.ts` with the straight-text case — see #92 above)                                |  ✅  | ✅ `text-on-path.spec.ts` |
| 95  | Typing path-text with no active selection shows a fill-less ribbon outline around the whole typed content (`drawCurvedEditingOutline.ts`), not just around an actively-dragged selection                                                               |  —   | ✅ `text-on-path.spec.ts` |
| 96  | Releasing without dragging (a plain click) still creates a default 100×100 path, top-left anchored at the click point, and starts editing on it                                                                                                        |  —   | ✅ `text-on-path.spec.ts` |
| 341 | The container's own "W x H" size badge stays hidden while actively typing fresh path-text, instead of rendering below the still-selected draft path for as long as typing continues                                                                    |  ✅  | ✅ `text-on-path.spec.ts` |

#77/#78 stay unit-only: `getVisibleCurvedContent.spec.ts` and `continuePathOffsetDrag.spec.ts` already
assert the exact resulting visible content / offset value via direct function calls and
`store.getState()`, which a screenshot diff can't improve on precisely — see "why so few scenarios
get e2e coverage" below. #76 gets e2e coverage despite having exact unit coverage too
(`handleUpdateNode.spec.ts`'s cascade tests) because the interesting failure mode is specifically a
real `pointerdown`→`pointermove`→`pointerup` resize-handle drag on a _live-rendered_ curved-text
node actually repainting in sync — the same "real browser + rendering + timing" category as the
Resize section's #66 above, not just the reducer math in isolation.

#90 is a real, reported regression: `useDrawTextOnPathTool.ts` selects the draft path node
(`setSelection([pathNodeId])`) purely so the dashed "editing" outline (#88 below) can resolve before
the real text node exists yet — but `useCommitTextEdit.ts` never reconciled `selectedIds` once the
actual text node was created, so the stale path id stayed selected after commit even though
`drawPerNodeSelectionOutlines.ts`'s `NodeType.path` branch never draws anything for it (nothing
visible reads as "selected"). Hit-testing doesn't share that same path-type exclusion though:
`useHoverHighlight.ts` trusts `selectedIds` directly when computing which resize-handle hit zones
are active, so the invisible-but-still-selected path kept responding to a resize-cursor hover as if
genuinely selected. Selecting then deselecting the node "fixed" it only as a side effect, by
overwriting/clearing that stale id — reported live as "select it once and the problem goes away."
Fixed in `useCommitTextEdit.ts`: `selectedIds` is now cleared once a new (non-editing) path-bound
box commits, regardless of whether text was typed or not, matching the plain Text tool's own
existing "never auto-selected after creation" convention (confirmed against #79 below, which already
encodes that a freshly committed path-text node reads as fully unselected). The unit suite
(`commitTextNode.spec.ts`, `useCommitTextEdit.spec.tsx`) asserts `store.getState().design.selectedIds`
directly and precisely; the e2e version proves the actual observable symptom instead — hovering the
path's own corner right after committing, without ever having clicked the node, must show no resize
cursor at all, whereas hovering that exact same point once the node is genuinely selected does. The
commit step deliberately blurs via a toolbar button click, not a canvas click: clicking empty canvas
would itself dispatch `setSelection([])` through the ordinary selection tool regardless of this fix,
which would mask whether the commit itself left anything stale behind. The test also "warms up" the
resize cursor on an unrelated node first, mirroring the Resize section's #43 rationale — the very
first resize-cursor hover in a cold page can take close to a second to decode, and skipping this step
risks the "no cursor" assertion passing for the wrong reason (image not decoded yet) instead of the
real one (nothing is actually selected).

#84/#85 are `useCurvedCaretEditing.ts`: a real `document`-level `pointerdown`/`pointermove`/
`pointerup` listener that hit-tests the click against the curve's own per-character arc-length
boundaries (`getCurvedCaretIndexAtPoint.ts`, reusing the same boundary/offset math `#77`'s
truncate-on-overflow and `isPointInCurvedText.ts` already use), then moves the real DOM selection inside the
`contentEditable` overlay via `setEditableSelectionRange.ts` — a plain range/offset calculation in
jsdom for the unit suite (`useCurvedCaretEditing.spec.tsx`, `getCurvedCaretIndexAtPoint.spec.ts`,
`setEditableSelectionRange.spec.ts` all assert the exact index/distance/selection precisely), but
the actual claim worth proving in a real browser is that clicking/dragging at real screen
coordinates against the real rendered MSDF glyphs on an ellipse produces the correct caret
position/selection, and that a subsequent real `page.keyboard.type` inserts/replaces at that exact
spot — not just that the app _asked_ the DOM to do so. Both tests sidestep needing an accessibility
tree or `store.getState()` (unavailable/unreachable from e2e, same constraint as every other
screenshot-based scenario here): #84 compares two independently-drawn pages where the only
difference is which point on the curve was clicked before typing the same character, and #85
compares the pre-edit "Hi" render against the post-drag-select-and-retype render, so any pixel
difference can only come from the caret/selection actually landing where the interaction implies.

#87 was a real, reported regression found right after #84/#85 shipped: `getCurvedCaretIndexAtPoint.ts`
and `isPointInCurvedText.ts` already unrotated the query point via `getNearestEllipsePathOffset`'s
own `rotation` handling, so a rotated path's hit-testing happened to already be correct — but neither
util accounted for the box's own `flipX`/`flipY` (mirroring the query point back before running the
curve math, the same `flipTextPoint` step `getStraightCaretIndexAtPoint.ts` already does for straight
text), so a _flipped_ path-text node's clicks were silently wrong. Separately, and worse: the
_rendered_ caret/selection-highlight during an active edit session (`drawCurvedCaret.ts`,
`drawCurvedSelectionHighlight.ts`, via `getCurvedCaretPoint.ts`/`getCurvedSelectionRects.ts`) never
took `rotation` **or** `flipX`/`flipY` into account at all — it always computed the caret's local,
unrotated/unflipped position on the ellipse and drew it there directly, so a rotated or flipped
path-text node's caret/highlight rendered as if `rotation: 0` regardless of the click landing on the
correct character underneath. Fixed with a new shared `transformCurvedPoint.ts` (mirroring the
already-established `flipTextPoint`-then-`rotatePoint` order used everywhere else in this codebase
for rotated/flipped hit-testing and rendering) applied to both the caret point and every selection
rect before they're drawn. The unit suite (`transformCurvedPoint.spec.ts`,
`getCurvedCaretIndexAtPoint.spec.ts`, `isPointInCurvedText.spec.ts`, `drawCurvedCaret.spec.ts`,
`drawCurvedSelectionHighlight.spec.ts`) pins the exact position/angle math and proves each rendered
buffer actually changes for a rotated/flipped box, but #87's e2e version is the same
"real screen coordinates against real rendered glyphs" category as #84/#85: it rotates a real
path-text node exactly 180 degrees (dragging the rotate ring to the reflection of the arm point
through the node's own center, guaranteeing the delta precisely, same trick `edit-text.spec.ts`'s
equivalent straight-text scenario uses), clicks the screen point where "H" now actually renders, and
compares against clicking that identical screen point on an unrotated reference — any pixel
difference can only come from the caret genuinely landing on the rotated content, not the pre-fix
rotation-0 assumption.

#341 is the same class of real, reported regression as #90 above, and shares its root cause:
`drawEllipsePath.ts`/`attachToVector.ts` select the draft path node purely so the dashed "editing"
outline can resolve before the real text node exists yet, and `startTextEdit` dispatches with no
`id` for a brand-new path-text node, so `editingNodeId` stays `null` for as long as typing
continues. `drawSelectionOutline.ts` already knew to skip the path being text-edited (its own
`editingPathId` param, threaded from `editingTextBox?.pathId`), but `drawSelectionSizeLabel.ts`
never got the same treatment — it only ever excluded vector-editing nodes, so the still-selected
draft path kept getting handed straight to it, and the container's own "200 x 200"-style badge
rendered below the box for the entire time content was being typed. Fixed by threading the same
`editingTextBox?.pathId` into `drawSelectionSizeLabel` and excluding that id, exactly mirroring
`drawSelectionOutline`'s existing `editingPathId` filter. `drawSelectionSizeLabel.spec.ts` asserts
`drawValueLabel` is never called when the only selected node is the path being text-edited; the e2e
version proves the actual pixels: a strip of canvas just below a freshly-drawn, actively-typed
path's bounding box must differ from the same strip below a plain rectangle drawn at the identical
box and left selected (a control proving the strip really does capture the badge when one exists).

## Text on Path outline visibility (hidden / hover / selected)

The path's own curve used to render unconditionally, every frame, in a plain white stroke — a
permanent visual artifact of an otherwise-invisible implementation-detail node. It now stays
hidden until there's a reason to show it (`getPathOutlineStyles.ts` + `drawPathOutline.ts`,
consumed from `drawSceneNodes.ts`'s `NodeType.path` branch), with a real click/hover surface that
belongs to the bound text, not the box: `getNodeAtPoint.ts` gained a `NodeType.path → false` branch
(the bare path node is now never itself hit-testable — every interaction routes through the paired
text node) and a new `isPointInCurvedText.ts` replaces the old bounding-box fallback for
path-linked text, testing perpendicular distance to the actual curve _and_ arc-length position
against the rendered content's real span, not just "inside the box." Style priority is
hover-first: hovering the rendered text always shows the thicker `DRAFT_FRAME_STROKE` hover
outline, even while already selected (the "you can grab it right here" affordance); selected-but-
not-hovered falls back to a thin outline at the same stroke width/mechanism as the ordinary
box-with-corner-handles outline (both are plain `gl.LINE_LOOP` draws, no thickness parameter).
While drawing a fresh path or actively typing its text (first creation _or_ re-edit), the box's
usual rectangular selection outline and corner handles are suppressed entirely for the path node
(`drawDraftShape.ts`'s `NodeType.path` case skips the shared corner-handles tail;
`drawPerNodeSelectionOutlines.ts` and `drawEditingTextBoxOutline.ts` both special-case it out) —
only the bare ellipse curve shows, using `editingTextBox.pathId` to resolve the outline style even
before the real text node exists in the store yet (first-time creation has no text node until
commit — only the editing box).

| #   | Scenario                                                                                                                                                                 | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :-----------------------: |
| 79  | The path outline is fully hidden when its text is neither hovered, selected, nor being edited — resting inside the bounding box but off the curve shows nothing          |  ✅  | ✅ `text-on-path.spec.ts` |
| 80  | Hovering exactly on the rendered curved text (not the bare curve, not the bounding box) shows the thick hover outline; the bare path node is never itself hit-testable   |  ✅  | ✅ `text-on-path.spec.ts` |
| 81  | Selecting the text via a real click on its rendered glyphs shows the outline in its thin "selected" style                                                                |  ✅  | ✅ `text-on-path.spec.ts` |
| 82  | Hovering the text while it's already selected switches the outline to the thicker hover style, instead of staying on the thin selected style                             |  ✅  | ✅ `text-on-path.spec.ts` |
| 83  | Neither the drag-to-create draft nor the live-typing phase (first creation or re-edit) shows a rectangular box/corner-handles outline for the path — only the bare curve |  ✅  |             —             |
| 88  | The bare curve renders dashed while actively drawing or editing the path (first creation or re-edit), instead of the solid outline used once just selected/hovered       |  ✅  | ✅ `text-on-path.spec.ts` |
| 89  | Hovering the path-offset handle shows the hand cursor; pressing and dragging it switches to the pressing cursor, reverting to the hand cursor on release                 |  ✅  | ✅ `text-on-path.spec.ts` |

#79-#82 all live in one e2e test, since they're really one continuous state-machine walk (hidden →
hover → back to hidden → selected → selected+hover) and splitting it into separate tests would just
mean re-drawing the same path four times — the same efficiency reasoning `hover.spec.ts`'s single
frame-hover test already uses for its own hide/show/hide sequence. Each transition is exactly the
"real browser + rendering + timing" category this file is for: a real `pointermove` against
real-rendered curved MSDF glyphs deciding which of three draw calls (`drawEllipse` thin,
`drawThickEllipseOutline` thick, or nothing) actually paints, which `getPathOutlineStyles.spec.ts`
can pin down as pure branch logic but can't prove a real browser repaints in response to. #83 stays
unit-only: `drawDraftShape.spec.ts`, `drawPerNodeSelectionOutlines.spec.ts`, and
`drawEditingTextBoxOutline.spec.ts` already count the exact WebGL draw calls (or their absence) for
every phase precisely — the claim is "this specific draw call never happens," which a screenshot
diff can't express any more precisely than the call-count assertion already does.

#88 gave the "editing" state its own `TPathOutlineStyle` (previously `getPathOutlineStyles.ts`
folded active editing into the same `'selected'` bucket as a plain, non-editing selection, so both
rendered identically via `drawEllipse`'s solid `LINE_LOOP` stroke) so a user can tell "I'm actively
drawing/typing this path" apart from "I've just selected an already-committed one" at a glance —
reported live: a plain-selected path and an actively-edited one looked indistinguishable. Editing
now routes through a new `drawDashedEllipseOutline.ts`, which walks the curve by real arc length
(`buildEllipseArcLengthTable`/`getEllipsePathSample`, the same machinery the path-text caret/offset
math already uses, not a fixed angle-step sample) so the dash/gap pattern tiles evenly regardless of
the ellipse's aspect ratio, and draws each dash as a disconnected `gl.LINES` pair instead of a closed
`gl.LINE_LOOP`, so real gaps show between dashes. It takes priority over hover too — the point of the
dashed state is knowing you're mid-edit, so resting the pointer on your own curve while typing must
not flash it over to the thicker hover style. The dash/gap lengths (`DASH_LENGTH_PX`/`DASH_GAP_PX`,
`constant/canvas.ts`) are defined in screen pixels and divided by `viewport.zoom` before being
converted to a world-space dash count every frame, so the pattern re-tiles denser while zoomed in and
sparser while zoomed out, live, the same "constant on-screen size regardless of zoom" convention
`CARET_WIDTH_PX`/`HOVER_OUTLINE_WIDTH` already use elsewhere — first shipped as a fixed
angle-based sample (a constant dash count regardless of zoom or circle size), corrected after
live feedback that it needed to scale with zoom instead. Used from both `drawDraftShape.ts`'s
`NodeType.path` case (the initial drag-to-create phase, before any text node exists) and
`drawPathOutline.ts`'s `'editing'` branch (re-editing an existing path-text node). The unit suite
(`drawDashedEllipseOutline.spec.ts`, `getPathOutlineStyles.spec.ts`, `drawPathOutline.spec.ts`,
`drawDraftShape.spec.ts`) already asserts the exact zoom-scaled dash count and `gl.LINES`-vs-
`gl.LINE_LOOP` draw calls precisely — including that doubling/halving the zoom doubles/halves the
dash count — which a screenshot diff can't improve on for the zoom-scaling claim specifically (per
the "why so few scenarios get e2e coverage" rationale below), so #88's e2e version sticks to the
same "real browser repaints in response" claim as #79-82: it draws a fresh path, types into it
(still mid-edit, dashed), then commits and re-selects it (solid) and asserts the two screenshots
differ.
