// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorPaintHoverPreview } from '../drawVectorPaintHoverPreview';

const bakeVectorNodeRotationMock = vi.fn();
const deriveVectorFacesMock = vi.fn();
const drawVectorFillMock = vi.fn();

vi.mock('components/Design/Canvas/utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (...args: unknown[]): unknown => bakeVectorNodeRotationMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/deriveVectorFaces', () => ({
  deriveVectorFaces: (...args: unknown[]): unknown => deriveVectorFacesMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorFill', () => ({
  drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node: TVectorNode = {
  fillColor: '#000000',
  filledFaceKeys: ['k1'],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#ffffff',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('drawVectorPaintHoverPreview', () => {
  beforeEach(() => {
    bakeVectorNodeRotationMock.mockReturnValue({ segments: {}, vertices: {} });
    deriveVectorFacesMock.mockReset();
    drawVectorFillMock.mockClear();
  });

  it('should draw nothing when there is no editing node', () => {
    // before
    drawVectorPaintHoverPreview(gl, program, buffer, null, 'k1', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when nothing is hovered', () => {
    // before
    drawVectorPaintHoverPreview(gl, program, buffer, node, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered face key no longer matches any current face (e.g. its segments were deleted)', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorPaintHoverPreview(gl, program, buffer, node, 'stale-key', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();
  });

  it('should fill the hovered face with the remove color when it is already filled', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorPaintHoverPreview(gl, program, buffer, node, 'k1', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 0, y: 0 }]], '#cd4422', 200, 150, IDENTITY_VIEWPORT, 0.2);
  });

  it('should fill the hovered face with the add color when it is not yet filled', () => {
    // mock
    const unfilledNode: TVectorNode = { ...node, filledFaceKeys: [] };

    deriveVectorFacesMock.mockReturnValue([{ key: 'k2', points: [{ x: 1, y: 1 }] }]);

    // before
    drawVectorPaintHoverPreview(gl, program, buffer, unfilledNode, 'k2', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 1, y: 1 }]], '#0d99ff', 200, 150, IDENTITY_VIEWPORT, 0.2);
  });
});
