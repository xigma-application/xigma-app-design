// types
import { AlignmentHorizontal, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawConstraintGuideCentreMarker } from '../drawConstraintGuideCentreMarker';

const drawXMarkerMock = vi.fn();
const drawVertexDotMock = vi.fn();

vi.mock('utils/canvas/drawXMarker', () => ({
  drawXMarker: (...args: unknown[]): void => drawXMarkerMock(...args),
}));

vi.mock('../../drawVectorEditHandlesLayer/drawVectorVertexDots/drawVertexDot', () => ({
  drawVertexDot: (...args: unknown[]): void => drawVertexDotMock(...args),
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

const parent: TFrameNode = {
  childIds: ['r1'],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 400,
  x: 100,
  y: 100,
};

const node = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x: 150,
  y: 130,
  ...overrides,
});

describe('drawConstraintGuideCentreMarker', () => {
  beforeEach(() => {
    drawXMarkerMock.mockClear();
    drawVertexDotMock.mockClear();
  });

  it('should draw the centre × marker and dot when a centre constraint is set', () => {
    // before
    drawConstraintGuideCentreMarker(context, node({ alignment: { horizontal: AlignmentHorizontal.center } }), parent);

    // result
    expect(drawXMarkerMock).toHaveBeenCalledTimes(1);
    expect(drawVertexDotMock).toHaveBeenCalledTimes(1);
  });

  it('should draw nothing for a non-centre constraint', () => {
    // before
    drawConstraintGuideCentreMarker(context, node(), parent);

    // result
    expect(drawXMarkerMock).not.toHaveBeenCalled();
    expect(drawVertexDotMock).not.toHaveBeenCalled();
  });
});
