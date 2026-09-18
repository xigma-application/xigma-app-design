# Video fill (`TVideoPaint`)

## What this is

A new paint type, `type: 'video'`, added alongside `'image'` in `types/design/paint/types.ts`.
The user's own spec, stated over several corrections: **"1:1 z image" — everything an Image fill
can do, minus two elements.**

Excluded:
- The `ImagePanel`'s adjustment sliders (`ImageAdjustmentSliders` — contrast/exposure/highlights/
  saturation/shadows/temperature/tint). `TVideoPaint` has no `adjustments` field at all.
- The canvas-floating **base** `ImageEditToolbar` (the one with the Fill/Fit/Crop/Tile dropdown +
  its own Crop button, shown while the editor is in `position`/`tile` mode). This toolbar's
  visibility check (`useImageEditToolbar.ts`) still gates on `fill.type === 'image'` only —
  **deliberately not widened** to video.

Included, 1:1 with image:
- The picker's Fill/Fit/Crop/Tile dropdown (`ImageFillModeRow` — reused verbatim, it's already
  paint-shape-agnostic).
- The floating **crop-mode** `ImageCropToolbar` (zoom slider, aspect ratio menu, Fit, Cancel,
  Confirm).
- The right-panel Crop panel (`PanelProperties/ImageCrop/` — Dimensions/Position/flip buttons).
- Canvas-drag crop editing: dragging/resizing/rotating the video inside its frame, tile-scale
  dragging, hover cursors for all of the above.

## Why the base toolbar is excluded but the picker dropdown isn't

These look similar but are two separate components reachable from the same "Crop" fill mode:
- `ImagePanel`'s `ImageFillModeRow` dropdown lives **inside the color picker popover** (the "Fill ▾"
  control visible in the picker body itself) — this is shared, reused as-is for video.
- `ImageEditToolbar` is a **separate floating toolbar drawn over the canvas** when an image/video
  fill is the current editor target — it duplicates the same Fill/Fit/Crop/Tile choice as a
  standalone Crop button + dropdown, for quick access without opening the picker.

Since there's no base toolbar for video, the *only* way to enter crop mode for a video fill is
through the picker's own dropdown (`ImageFillModeRow` → `useSetImagePaintScaleMode` → `setImageEditor`
with `mode: 'crop'`) — this already worked without any changes, since `useSetImagePaintScaleMode` was
widened to accept `paint.type === 'video'` (see below). No dead end: picking "Crop" from the panel's
own dropdown still fully arms the floating `ImageCropToolbar`.

## How the widening was done: "widen, don't duplicate" wherever the body is type-agnostic

Before writing any video-specific code, the whole Image editing pipeline was audited for
`paint.type === 'image'` gates (31+ files). Two different fixes were applied depending on what each
gate's *function body* actually touches:

**Widen the type/gate in place** (no new file) — used everywhere a function's own logic never
branches on which media type it is, only on shape-agnostic fields both paint types share
(`ref`, `rotation`, `scaleMode`, `crop`, `scale`, `flipX`/`flipY`). This was the overwhelming
majority of the ~30 touched files:
- Crop-geometry math: `getImageCropRect.ts`, `getEffectiveImageSize.ts`, `getImageTileRect.ts`, every
  util under `ImageCropToolbar/utils/` and `ImageCropAspectRatioMenu/utils/`
  (`computeImageCropZoomRect`, `commitImageCropZoom`, `commitFitNodeToImage`,
  `getAspectRatioPresetRect`, `commitAspectRatioPreset`, `isAspectRatioPresetActive`).
- Selectors: `selectImageCropTarget.ts` (`ImageCropToolbar`'s own target), `selectSelectedImageCrop.ts`
  (right-panel Crop panel's target) — both now return `paint: TImagePaint | TVideoPaint`.
- Canvas-drag mutation: `scaleFillsCrop.ts`, `translateFillsCrop.ts`, `rotateFillsCrop.ts`,
  `seedImageCropIfNeeded.ts`, every `armImageCropOnPointerDown/*` resolver, every
  `continueImageCrop*Drag.ts` mover, `resizeBoxNode.ts`'s `isMirrorableFill` (flip-on-resize).
- Hover cursors: `resolveImageCropRotateHover.ts`, `resolveImageCropResizeHover.ts`,
  `resolveImageTileScaleHover.ts`.
- Selection-outline drawing: `drawImageEditorSelectionOutline.ts`, `drawImageEditorCropImageOutline.ts`
  (pure geometry, no texture needed).
- FillRow-level: `useSetImagePaintScaleMode.ts`, `useRotateImagePaint.ts`,
  `useSetImagePaintTileScale.ts`, `getInitialImageEditorModeFromPaint.ts`,
  `getInitialImageFillModeFromPaint.ts` — all one-line `paint.type === 'image'` →
  `paint.type === 'image' || paint.type === 'video'` changes, since the body underneath never
  actually needed to know which one it was.
- `flipImageCropRigidly.ts`/`rotateImageCropRigidly.ts` needed **zero** changes — they already typed
  their param as `TSelectedImageCrop['paint']`, which inherited the widening for free once
  `selectSelectedImageCrop.ts` was widened.

**Add an explicit `case 'video':` / new branch** — used only where the function's own body
genuinely differs per paint type (a label, an icon, a distinct code path):
- `getFillRowHexDisplayValue.ts` / `getFillRowSwatchHex.ts` / `getFillRowInitialActiveTab.ts`: these
  `switch (paint.type)` on an elimination pattern (`default:` used to mean "must be gradient") — a
  `'video'` payload would have silently fallen into the gradient branch and crashed on
  `paint.stops`/`paint.start` (all genuinely missing on `TVideoPaint`). Each got its own explicit
  `case 'video':`.
- `paintGroupKey.ts`: added `case 'video':` alongside `case 'image':` (identical body — key by
  `ref`+`scaleMode`), for the same elimination-pattern reason.
- `drawVectorFillPaints.ts`: added a new `paint.type === 'video'` branch, **not** merged into the
  image branch, since actual pixel rendering genuinely differs (see below).

**Deliberately reverted, not widened**: `getCropTargetPaintIndex.ts` (the base `ImageEditToolbar`'s
own Crop-button targeting logic) was widened once, then reverted back to `fill.type === 'image'`
only — since the base toolbar itself never shows for video, its targeting logic including video
would be dead code that could only matter for a rare mixed image+video-fills-on-one-node edge case,
never discussed or asked for.

## Canvas rendering: a placeholder, not real video texture decoding

**Revised after the first pass**: the first implementation drew a flat `#8c8c8c` gray placeholder for
any `type: 'video'` paint, with no real pixels at all. The user pointed at the pre-existing Media tool
(`useDrawMediaTool/`, placing a video as a static `TMediaNode`) and said this exact problem — "you
can't see 1 frame of the video on canvas" — was already solved there, and to reuse that solution
("Podobny" — similar). It was: `TMediaNode.src` is **never the raw video file** — `loadArmedMedia.ts`
detects a video MIME type and runs `extractVideoFrame.ts` (seeks a hidden `<video>` element to ~0.1s,
draws that frame onto an offscreen `<canvas>`, and `toBlob()`s it into a PNG). The node's `src` is
permanently that PNG's blob URL — the original video file is discarded once placed. A `TMediaNode` is,
after placement, indistinguishable from an image node internally.

The video **paint** now does the same thing, and it changes what `ref` means for `TVideoPaint`:
`ref` is the extracted still frame's PNG blob URL, not the raw video. This was the key unlock — once
`ref` is a real decodable image, **every existing image-fill mechanism works on it completely
unchanged**: `drawVectorFillPaints.ts`'s `'video'` branch was merged into the same `drawVectorImageFill`
call as `'image'` (just forwarding `undefined` for the `adjustments` param, since `TVideoPaint` has
none) instead of drawing a placeholder; `getEffectiveImageSize`/`getImageTileRect`/`imagePaintTextureSizeCache`
need no video-specific logic at all, since they're just handed a normal image URL.

`extractVideoFrame.ts` itself was **moved**, not duplicated: from `useDrawMediaTool/utils/` (Design-
canvas-specific) to the global `utils/canvas/extractVideoFrame.ts`, since it now has two genuinely
separate consumers (the Media tool and the Video paint picker) — per the "second consumer promotes a
util to a shared location" rule. `useDrawMediaTool/utils/loadArmedMedia.ts`'s own `TArmedMedia` type is
now just an alias (`export type TArmedMedia = TExtractedVideoFrame;`) so every existing consumer of
`loadArmedMedia` kept working unchanged.

`useVideoPanel.ts`'s `setVideo` calls `extractVideoFrame(file, ({src}) => ...)` and stores the
resulting frame URL in its `videoUrl` field (the field name is a pre-existing naming carryover, not
renamed — it now holds an extracted-frame image URL, same as `TMediaNode.src`, not a raw video blob).
`VideoSourcePreview.tsx` was corrected to match: it originally rendered a live `<video muted playsInline>`
element (which no longer makes sense once `videoUrl` is a still frame, not a playable source) and now
uses the identical `background-image` CSS approach as `ImageSourcePreview.tsx`.

Two overflow-preview drawers were **not** widened and still don't draw for video:
`drawImageEditorCropOverflowPreview.ts`/`drawImageEditorTileOverflowPreview.ts` read their texture from
`imageTextureCache` keyed by `paint.ref` — which now works for video too in principle, but neither was
touched since the crop-rect *outline* (a separate, already-widened drawer) already gives adequate
crop-mode feedback and no one asked for the overflow-bleed preview specifically. Real live video
*playback* on canvas — decoding frames as the video plays, not just showing one static frame — remains
out of scope; nothing in this feature ever asked for it, and it would be a separate, much larger
WebGL video-texture subsystem (`requestVideoFrameCallback` + per-frame `texImage2D`).

## The picker UI: `VideoPanel`, mirroring `ImagePanel` minus adjustments

New folder `shared/UITools/ColorPicker/Body/VideoPanel/`, structured exactly like `ImagePanel/`:
`VideoPanel.tsx` (reuses `ImagePanel`'s own `ImageFillModeRow` directly — no duplicate needed, see
above), `VideoSourcePreview/` (background-image preview of the extracted frame, see above),
`VideoSourceButtons/` (upload-only — no "Make a video" AI-generation equivalent exists to mirror),
`hooks/useVideoPanel.ts` (near-identical twin of `useImagePanel.ts`, minus adjustments logic which
`useImagePanel` never had anyway, plus the `extractVideoFrame` call), `types.ts`/`constants.ts`/`utils/`
(`isSupportedVideoFile.ts` checks `video/*`, `getFileExtension.ts` duplicated verbatim — both trivial,
kept local rather than reaching into `ImagePanel/utils/`).

`ColorPickerTab.video` added to the shared enum; `PaintTypeRow.tsx` gained a `Video` tab button
(icon `"Video"`, already existed in `@xigma/components`).

## The right-panel Crop header shows "Video" for a video crop target

`ImageCropHeader.tsx`'s label used to be a hardcoded "Image" translation key regardless of what was
being cropped. New `hooks/useImageCropHeaderLabel.ts` reads `selectSelectedImageCrop` (already widened
to cover video) and switches to a new `imageCropHeader.videoLabel` ("Video"/"Wideo") key when
`paint.type === 'video'`, falling back to the existing "Image" label otherwise.

## The Dimensions row's aspect-ratio lock button is hidden entirely for a crop target

Separately, the user asked to hide the aspect-ratio lock button in `ColumnDimensions` (shared by every
right-panel Dimensions row, not just the Crop panel) when editing a crop target — since
`useColumnDimensions.ts` already forces `locked: true, lockDisabled: true` unconditionally whenever
`selectSelectedImageCrop` returns a target ("nie ma sensu go tam pokazywać" — showing a permanently
disabled toggle serves no purpose). Fix: `ColumnDimensions.tsx` now passes `buttonsIcon={lockDisabled
? [] : ColumnDimensionsButtonIcons(...)}` — `lockDisabled` is the exact, pre-existing signal for "this
is a crop target," so no new selector or prop was needed. Applies to Image and Video crop targets
alike, and leaves every other node type's Dimensions row (which never has `lockDisabled: true`)
completely unaffected.

**`ColorPicker.tsx` itself** needed the same `useImagePanel`/`onImageChange`/`isImageTabActive`
plumbing duplicated for video, not merged, since each of these tiny hooks
(`useNotifyImagePanelState`, `useNotifyImageTabActiveState`) only ever has ~10 lines and matches this
codebase's established one-hook-per-concern style better than a generic parametrized version. The one
exception: `useSyncFillModeWithImageEditorCrop` and `useIgnoreDismissWhileImageTabActive` are called
**twice** (once per tab) / passed a combined `isImageTabActive || isVideoTabActive` respectively,
since their bodies were already 100% paint-type-agnostic (they only look at `imageEditor.mode`/a
plain boolean) — duplicating them would have added a file for zero behavioral difference.

**`useSetActiveTab.ts`** (which fires a paint-conversion callback when the picker tab changes) got a
`case ColorPickerTab.video:` calling a new `onVideoChange` prop, mirroring the existing `image` case
exactly.

## `FillRow.tsx`: the Design-app wiring layer

`isVideo = paint.type === 'video'`, alongside the existing `isImage`. Two new per-FillRow pieces of
state, `isVideoTabActive`/`setIsVideoTabActive`, mirroring `isImageTabActive` — both feed into a
single combined `useSyncImageEditor(..., isImageTabActive || isVideoTabActive, ...)` call, since that
hook (Redux-state wiring for `imageEditor`/`imageFillPickerFocus`) was already fully paint-type-
agnostic.

New: `useConvertToVideoPaint.ts` (`FillRow/hooks/`), a byte-for-byte structural twin of
`useConvertToImagePaint.ts` — builds a fresh `TVideoPaint` from scratch on first pick, or merges onto
an existing one (preserving crop/rotation/flip) when a file replaces an already-cropped video, exactly
matching the pre-existing image regression fix this mirrors.

Reused directly for video (no new hook needed, since the widening above already covers them):
`handleImageRotate` (`useRotateImagePaint`), `handleImageScaleModeChange`
(`useSetImagePaintScaleMode`), `handleImageTileScaleChange` (`useSetImagePaintTileScale`) — each is
passed to *both* `onImageRotate`/`onVideoRotate` etc. on `ColorPickerInput`, since the same function
instance already branches internally on `paint.type`.

## Known rough edges (accepted, not fixed)

- `ImageFillModeRow`'s rotate button aria-label/tooltip text says "Rotate image" even when editing a
  video paint (`colorPicker.image.rotateAriaLabel`/`rotateTooltip`) — the component is reused as-is,
  not parametrized with a translation namespace. Cosmetic only.
- `useConvertToVideoPaint`'s "picked video URL echoed into the trigger swatch before the Redux
  round-trip" (`ColorPickerInput`'s `pickedImageUrl` local-state pattern) was **not** mirrored for
  video — the swatch always renders white for a video fill (`getFillRowSwatchHex`) regardless, so
  there's nothing for a live thumbnail echo to improve yet.
