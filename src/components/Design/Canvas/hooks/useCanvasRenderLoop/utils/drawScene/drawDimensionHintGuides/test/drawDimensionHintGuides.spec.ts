// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawDimensionHintGuides } from '../drawDimensionHintGuides';

const drawDashedLineMock = vi.fn();
const drawDimensionHintArrowheadMock = vi.fn();
const drawLineMock = vi.fn();
const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/drawDashedLine', () => ({ drawDashedLine: (...args: unknown[]): void => drawDashedLineMock(...args) }));
vi.mock('../drawDimensionHintArrowhead', () => ({
  drawDimensionHintArrowhead: (...args: unknown[]): void => drawDimensionHintArrowheadMock(...args),
}));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

describe('drawDimensionHintGuides', () => {
  beforeEach(() => {
    drawDashedLineMock.mockClear();
    drawDimensionHintArrowheadMock.mockClear();
    drawLineMock.mockClear();
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing when there are no guides', () => {
    // before
    drawDimensionHintGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawDashedLineMock).not.toHaveBeenCalled();
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawDimensionHintArrowheadMock).not.toHaveBeenCalled();
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw a plain solid line in the color matching the guide, without an arrowhead', () => {
    // before
    const guides = { labels: [], lines: [{ color: 'blue' as const, x1: 0, x2: 100, y1: 50, y2: 50 }] };

    drawDimensionHintGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { dimensionHintGuidesRef: { current: guides } } }),
    );

    // result
    expect(drawLineMock).toHaveBeenCalledWith(gl, program, buffer, guides.lines[0], '#0d99ff', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawDashedLineMock).not.toHaveBeenCalled();
    expect(drawDimensionHintArrowheadMock).not.toHaveBeenCalled();
  });

  it('should draw a dashed line in red when the guide is marked dashed', () => {
    // before
    const guides = { labels: [], lines: [{ color: 'red' as const, dashed: true, x1: 0, x2: 0, y1: 0, y2: 80 }] };

    drawDimensionHintGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { dimensionHintGuidesRef: { current: guides } } }),
    );

    // result
    expect(drawDashedLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      guides.lines[0],
      '#cd4422',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
      3,
      4.5,
    );
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should draw an arrowhead at the end point when the guide requests one', () => {
    // before
    const guides = { labels: [], lines: [{ arrowAtEnd: true, color: 'blue' as const, x1: 0, x2: 100, y1: 0, y2: 0 }] };

    drawDimensionHintGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { dimensionHintGuidesRef: { current: guides } } }),
    );

    // result — the arrowhead's tip sits at the line's end point, pointing back toward its start
    expect(drawDimensionHintArrowheadMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 100, y: 0 },
      { x: 0, y: 0 },
      '#0d99ff',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw every label at its anchor, colored to match the guide, with an edge gap', () => {
    // before
    const guides = {
      labels: [{ anchor: { x: 40, y: 60 }, color: 'red' as const, offsetDirection: { x: 1, y: 0 }, text: '120px' }],
      lines: [],
    };

    drawDimensionHintGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { dimensionHintGuidesRef: { current: guides } } }),
    );

    // result
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      '120px',
      { x: 40, y: 60 },
      { x: 1, y: 0 },
      200,
      150,
      IDENTITY_VIEWPORT,
      { edgeGapPx: 5, fill: '#cd4422' },
    );
  });
});
