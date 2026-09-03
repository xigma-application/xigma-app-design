// types
import { TGuideLine } from 'types/design/guides/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawGuides } from '../drawGuides';

const drawLineMock = vi.fn();
const getDraggingGuideLineMock = vi.fn();
const getGuideSegmentMock = vi.fn();
const getGuideStyleMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('../getDraggingGuideLine', () => ({ getDraggingGuideLine: (...args: unknown[]): unknown => getDraggingGuideLineMock(...args) }));
vi.mock('../getGuideSegment', () => ({ getGuideSegment: (...args: unknown[]): unknown => getGuideSegmentMock(...args) }));
vi.mock('../getGuideStyle', () => ({ getGuideStyle: (...args: unknown[]): unknown => getGuideStyleMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const context = { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT };
const segment = { x1: 0, x2: 0, y1: 0, y2: 0 };

describe('drawGuides', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    getDraggingGuideLineMock.mockClear();
    getGuideSegmentMock.mockClear();
    getGuideStyleMock.mockReset().mockReturnValue({ alpha: 0.5, color: '#cd4422' });
    getGuideSegmentMock.mockReturnValue(segment);
  });

  it('should draw nothing when there are no guides and nothing is being dragged', () => {
    // before
    drawGuides(context, [], {}, createCanvasRefs(), true);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(getDraggingGuideLineMock).not.toHaveBeenCalled();
  });

  it('should draw each guide line using the segment and style it computes, idle by default', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];

    // before
    drawGuides(context, guideLines, {}, createCanvasRefs(), true);

    // result
    expect(getGuideSegmentMock).toHaveBeenCalledWith(guideLines[0], 200, 150, IDENTITY_VIEWPORT);
    expect(getGuideStyleMock).toHaveBeenCalledWith(guideLines[0], false, null, null);
    expect(drawLineMock).toHaveBeenCalledWith(gl, program, buffer, segment, '#cd4422', 1, 200, 150, IDENTITY_VIEWPORT, 0.5);
  });

  it('should pass the hovered and selected guide ids through to getGuideStyle', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];
    const refs = createCanvasRefs({
      guides: {
        hoveredGuideRef: { current: { frameId: null, id: 'hovered-id' } },
        selectedGuideRef: { current: { frameId: null, id: 'selected-id' } },
      },
    });

    // before
    drawGuides(context, guideLines, {}, refs, true);

    // result
    expect(getGuideStyleMock).toHaveBeenCalledWith(guideLines[0], false, 'hovered-id', 'selected-id');
  });

  it('should swap the committed line for the live preview while dragging an existing guide, marking it active', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];
    const draggingLine: TGuideLine = { axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 90 };
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'x', frameId: null, hasMoved: true, id: 'guide-1', position: 90 } } },
    });

    getDraggingGuideLineMock.mockReturnValue(draggingLine);

    // before
    drawGuides(context, guideLines, {}, refs, true);

    // result — only the live preview is drawn, never the stale committed line
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(getGuideSegmentMock).toHaveBeenCalledWith(draggingLine, 200, 150, IDENTITY_VIEWPORT);
    expect(getGuideStyleMock).toHaveBeenCalledWith(draggingLine, true, null, null);
  });

  it('should append the drag-out preview (uncommitted, empty id) as an extra, active line', () => {
    // mock
    const draggingLine: TGuideLine = { axis: 'x', frameId: null, id: '', span: null, worldPosition: 75 };
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'x', frameId: null, hasMoved: false, id: null, position: 75 } } },
    });

    getDraggingGuideLineMock.mockReturnValue(draggingLine);

    // before
    drawGuides(context, [], {}, refs, true);

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(getGuideStyleMock).toHaveBeenCalledWith(draggingLine, true, null, null);
  });

  it('should draw nothing at all when rulers are hidden, even with guides present and one being dragged', () => {
    // mock
    const guideLines: TGuideLine[] = [{ axis: 'x', frameId: null, id: 'guide-1', span: null, worldPosition: 50 }];
    const refs = createCanvasRefs({
      guides: { draggingGuideRef: { current: { axis: 'x', frameId: null, hasMoved: true, id: 'guide-1', position: 90 } } },
    });

    // before
    drawGuides(context, guideLines, {}, refs, false);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(getGuideSegmentMock).not.toHaveBeenCalled();
    expect(getDraggingGuideLineMock).not.toHaveBeenCalled();
  });
});
