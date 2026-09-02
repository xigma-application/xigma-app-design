// types
import { NodeType } from 'types/design/enums';
import { TGuideLine } from 'types/design/guides/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawGuides } from '../drawGuides';

const drawLineMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({
  drawLine: (...args: unknown[]): void => drawLineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const context = { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT };

const frame: TSceneNode = {
  fill: '#ff0000',
  height: 100,
  id: 'frame',
  name: 'frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
};

describe('drawGuides', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should draw nothing when there are no guides and nothing is being dragged', () => {
    // before
    drawGuides(context, [], {}, createCanvasRefs());

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should span the full viewport for a page (x-axis) guide', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];

    // before
    drawGuides(context, guideLines, {}, createCanvasRefs());

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 50, x2: 50, y1: 0, y2: 150 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should span the full viewport for a page (y-axis) guide', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'y', frameId: null, id: 'guide-1', span: null, worldPosition: 30 }];

    // before
    drawGuides(context, guideLines, {}, createCanvasRefs());

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 0, x2: 200, y1: 30, y2: 30 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should clip a frame guide to its own span instead of the viewport', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'y', frameId: 'frame', id: 'guide-1', span: { from: 10, to: 210 }, worldPosition: 25 }];

    // before
    drawGuides(context, guideLines, { frame }, createCanvasRefs());

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 10, x2: 210, y1: 25, y2: 25 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should clip a vertical (x-axis) frame guide to its own span too', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: 'frame', id: 'guide-1', span: { from: 20, to: 120 }, worldPosition: 40 }];

    // before
    drawGuides(context, guideLines, { frame }, createCanvasRefs());

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 40, x2: 40, y1: 20, y2: 120 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should overlay a frame guide being dragged out (uncommitted, id null) clipped to that frame', () => {
    // mock
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'y', frameId: 'frame', hasMoved: false, id: null, position: 60 } } },
    });

    // before
    drawGuides(context, [], { frame }, refs);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 10, x2: 210, y1: 60, y2: 60 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should overlay a page guide being dragged out (uncommitted, id null) spanning the viewport', () => {
    // mock
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'x', frameId: null, hasMoved: false, id: null, position: 75 } } },
    });

    // before
    drawGuides(context, [], {}, refs);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 75, x2: 75, y1: 0, y2: 150 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should clip a dragged frame guide to that frame, looked up by id', () => {
    // mock
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'y', frameId: 'frame', hasMoved: false, id: 'guide-1', position: 60 } } },
    });

    // before
    drawGuides(context, [], { frame }, refs);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 10, x2: 210, y1: 60, y2: 60 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should fall back to spanning the viewport when the dragged guide names a frame that no longer exists', () => {
    // mock
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'y', frameId: 'missing', hasMoved: false, id: 'guide-1', position: 60 } } },
    });

    // before
    drawGuides(context, [], {}, refs);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 0, x2: 200, y1: 60, y2: 60 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw the moved guide only once, replacing its committed (pre-drag) line with the live preview', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'x', frameId: null, hasMoved: false, id: 'guide-1', position: 90 } } },
    });

    // before
    drawGuides(context, guideLines, {}, refs);

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 90, x2: 90, y1: 0, y2: 150 },
      expect.any(String),
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
