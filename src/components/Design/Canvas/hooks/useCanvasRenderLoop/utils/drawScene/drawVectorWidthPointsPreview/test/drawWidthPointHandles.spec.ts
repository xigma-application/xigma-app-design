// others
import { VECTOR_CUT_CROSSING_FILL, VECTOR_EDIT_OUTLINE_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { TVectorNode } from 'types/design/types';

// utils
import { drawWidthPointHandles } from '../drawWidthPointHandles';

const getVectorChainPositionAtFractionMock = vi.fn();
const getVectorSegmentPointAtTMock = vi.fn();
const getVectorSegmentNormalAtTMock = vi.fn();
const drawVectorCutPointMarkerMock = vi.fn();
const drawLineMock = vi.fn();
const drawDefaultWidthHandleDiamondMock = vi.fn();
const drawSelectedWidthHandleDiamondMock = vi.fn();
const drawSelectedWidthPointAnchorMock = vi.fn();

vi.mock('utils/canvas/vectorNetwork/getVectorChainPositionAtFraction', () => ({
  getVectorChainPositionAtFraction: (...args: unknown[]): unknown => getVectorChainPositionAtFractionMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorSegmentPointAtT', () => ({
  getVectorSegmentPointAtT: (...args: unknown[]): unknown => getVectorSegmentPointAtTMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorSegmentNormalAtT', () => ({
  getVectorSegmentNormalAtT: (...args: unknown[]): unknown => getVectorSegmentNormalAtTMock(...args),
}));
vi.mock('../../drawVectorCutPointMarker', () => ({
  drawVectorCutPointMarker: (...args: unknown[]): void => drawVectorCutPointMarkerMock(...args),
}));
vi.mock('utils/canvas/drawLine', () => ({
  drawLine: (...args: unknown[]): void => drawLineMock(...args),
}));
vi.mock('../drawDefaultWidthHandleDiamond', () => ({
  drawDefaultWidthHandleDiamond: (...args: unknown[]): void => drawDefaultWidthHandleDiamondMock(...args),
}));
vi.mock('../drawSelectedWidthHandleDiamond', () => ({
  drawSelectedWidthHandleDiamond: (...args: unknown[]): void => drawSelectedWidthHandleDiamondMock(...args),
}));
vi.mock('../drawSelectedWidthPointAnchor', () => ({
  drawSelectedWidthPointAnchor: (...args: unknown[]): void => drawSelectedWidthPointAnchorMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node: TVectorNode = {
  fillColor: '#000',
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
};

const chainOrder: TVectorChainOrder = { entries: [{ reversed: false, segmentId: 's1' }], isClosed: false };
const widthPoint = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };

describe('drawWidthPointHandles', () => {
  beforeEach(() => {
    getVectorChainPositionAtFractionMock.mockReset().mockReturnValue({ segmentId: 's1', t: 0.5 });
    getVectorSegmentPointAtTMock.mockReset().mockReturnValue({ x: 10, y: 10 });
    getVectorSegmentNormalAtTMock.mockReset().mockReturnValue({ x: 0, y: 1 });
    drawVectorCutPointMarkerMock.mockClear();
    drawLineMock.mockClear();
    drawDefaultWidthHandleDiamondMock.mockClear();
    drawSelectedWidthHandleDiamondMock.mockClear();
    drawSelectedWidthPointAnchorMock.mockClear();
  });

  it('should draw the guide line between the offset left/right handles, a default diamond at each, and a marker at the anchor when nothing is selected', () => {
    // mock — anchor (10,10), normal (0,1), leftOffset 4, rightOffset 6
    // before
    drawWidthPointHandles(gl, program, buffer, node, chainOrder, widthPoint, false, false, false, 200, 150, IDENTITY_VIEWPORT);

    // result — left handle = anchor + normal*left = (10, 14); right handle = anchor - normal*right = (10, 4)
    expect(getVectorChainPositionAtFractionMock).toHaveBeenCalledWith(node, chainOrder, 0.5);
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 10, x2: 10, y1: 14, y2: 4 },
      VECTOR_EDIT_OUTLINE_STROKE,
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawDefaultWidthHandleDiamondMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 14 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawDefaultWidthHandleDiamondMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 4 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawSelectedWidthHandleDiamondMock).not.toHaveBeenCalled();
    expect(drawVectorCutPointMarkerMock).toHaveBeenCalledWith(gl, program, buffer, { x: 10, y: 10 }, 200, 150, IDENTITY_VIEWPORT);
    expect(drawSelectedWidthPointAnchorMock).not.toHaveBeenCalled();
  });

  it('should draw the left handle selected and the right handle default when only the left side is selected, and switch the guide line to pink', () => {
    // before — grabbing a diamond also marks the point itself selected
    drawWidthPointHandles(gl, program, buffer, node, chainOrder, widthPoint, true, false, true, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 10, x2: 10, y1: 14, y2: 4 },
      VECTOR_CUT_CROSSING_FILL,
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawSelectedWidthHandleDiamondMock).toHaveBeenCalledTimes(1);
    expect(drawSelectedWidthHandleDiamondMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 14 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawDefaultWidthHandleDiamondMock).toHaveBeenCalledTimes(1);
    expect(drawDefaultWidthHandleDiamondMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 4 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawSelectedWidthPointAnchorMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 10 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorCutPointMarkerMock).not.toHaveBeenCalled();
  });

  it('should draw the right handle selected and the left handle default when only the right side is selected, and switch the guide line to pink', () => {
    // before — grabbing a diamond also marks the point itself selected
    drawWidthPointHandles(gl, program, buffer, node, chainOrder, widthPoint, false, true, true, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 10, x2: 10, y1: 14, y2: 4 },
      VECTOR_CUT_CROSSING_FILL,
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawSelectedWidthHandleDiamondMock).toHaveBeenCalledTimes(1);
    expect(drawSelectedWidthHandleDiamondMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 4 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawDefaultWidthHandleDiamondMock).toHaveBeenCalledTimes(1);
    expect(drawDefaultWidthHandleDiamondMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 14 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawSelectedWidthPointAnchorMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 10 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorCutPointMarkerMock).not.toHaveBeenCalled();
  });

  it('should select only the anchor, leaving both diamonds default, when the center point is selected on its own', () => {
    // before — clicking the center anchor selects the point without grabbing either diamond
    drawWidthPointHandles(gl, program, buffer, node, chainOrder, widthPoint, false, false, true, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 10, x2: 10, y1: 14, y2: 4 },
      VECTOR_CUT_CROSSING_FILL,
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawSelectedWidthHandleDiamondMock).not.toHaveBeenCalled();
    expect(drawDefaultWidthHandleDiamondMock).toHaveBeenCalledTimes(2);
    expect(drawSelectedWidthPointAnchorMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 10, y: 10 },
      expect.any(Number),
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorCutPointMarkerMock).not.toHaveBeenCalled();
  });
});
