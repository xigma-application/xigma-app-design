// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { hasRectRenderOverrides } from '../hasRectRenderOverrides';

describe('hasRectRenderOverrides', () => {
  it('should be false when no drag preview is active', () => {
    // result
    expect(hasRectRenderOverrides(createCanvasRefs())).toBe(false);
  });

  it.each(['autoLayoutDropTargetRef', 'autoLayoutReorderPreviewRef', 'gridDragGhostRef', 'gridDropTargetRef'] as const)(
    'should be true when %s holds a value',
    (key) => {
      // mock
      const refs = createCanvasRefs();

      // before
      (refs.transform[key] as { current: unknown }).current = {};

      // result
      expect(hasRectRenderOverrides(refs)).toBe(true);
    },
  );
});
