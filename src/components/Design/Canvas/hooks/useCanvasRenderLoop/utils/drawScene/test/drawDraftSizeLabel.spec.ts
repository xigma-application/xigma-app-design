// types
import { NodeType } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawDraftSizeLabel } from '../drawDraftSizeLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 150,
  canvasWidth: 200,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

describe('drawDraftSizeLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing when there is no active draft', () => {
    // before
    drawDraftSizeLabel(context, createCanvasRefs());

    // result
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw a "W x H" badge below an in-progress rectangle/frame/section/ellipse/etc. draft', () => {
    // mock
    const refs = createCanvasRefs({
      draftRef: { current: { fill: '#ff0000', height: 100, type: NodeType.rectangle, width: 200, x: 0, y: 0 } },
    });

    // before
    drawDraftSizeLabel(context, refs);

    // result
    const [, , , , text, anchor, offsetDirection, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('200 x 100');
    expect(anchor.x).toBeCloseTo(100, 5);
    expect(anchor.y).toBeCloseTo(100, 5);
    expect(offsetDirection.y).toBeCloseTo(1, 5);
    expect(options.angleDeg).toBeCloseTo(0, 5);
  });

  it('should draw the same badge for an in-progress text-on-path draft (a NodeType.path draft rect)', () => {
    // mock
    const refs = createCanvasRefs({
      draftRef: { current: { height: 80, type: NodeType.path, width: 120, x: 0, y: 0 } as never },
    });

    // before
    drawDraftSizeLabel(context, refs);

    // result
    const [, , , , text] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('120 x 80');
  });

  it('should read an in-progress line draft by its own length, tilted along it, instead of its bounding box', () => {
    // mock
    const refs = createCanvasRefs({
      draftRef: { current: { stroke: '#000000', type: NodeType.line, x1: 0, x2: 100, y1: 0, y2: 100 } },
    });

    // before
    drawDraftSizeLabel(context, refs);

    // result
    const [, , , , text, , , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe(`${Math.round(Math.hypot(100, 100))} x 0`);
    expect(options.angleDeg).toBeCloseTo(45, 5);
  });
});
