// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorShapeBuilderHoverPreview } from '../drawVectorShapeBuilderHoverPreview';

const bakeVectorNodeRotationMock = vi.fn();
const deriveVectorFacesMock = vi.fn();
const drawVectorHatchFillMock = vi.fn();

vi.mock('components/Design/Canvas/utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (...args: unknown[]): unknown => bakeVectorNodeRotationMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/deriveVectorFaces', () => ({
  deriveVectorFaces: (...args: unknown[]): unknown => deriveVectorFacesMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorHatchFill', () => ({
  drawVectorHatchFill: (...args: unknown[]): void => drawVectorHatchFillMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node: TVectorNode = {
  fillColor: '#000000',
  filledFaceKeys: [],
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

const nodes: Record<string, TSceneNode> = { [node.id]: node };

describe('drawVectorShapeBuilderHoverPreview', () => {
  beforeEach(() => {
    bakeVectorNodeRotationMock.mockReturnValue({ segments: {}, vertices: {} });
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when nothing is touched', () => {
    // before
    drawVectorShapeBuilderHoverPreview(gl, program, buffer, nodes, {}, false, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a touched node id that no longer resolves to any node', () => {
    // before
    drawVectorShapeBuilderHoverPreview(gl, program, buffer, nodes, { missing: new Set(['k1']) }, false, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should hatch-fill every touched face on the node in the add color, by default', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([
      { key: 'k1', points: [{ x: 0, y: 0 }] },
      { key: 'k2', points: [{ x: 1, y: 1 }] },
    ]);

    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      { [node.id]: new Set(['k1', 'k2']) },
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledTimes(2);
    expect(drawVectorHatchFillMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      [[{ x: 0, y: 0 }]],
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorHatchFillMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      [[{ x: 1, y: 1 }]],
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should hatch-fill in the subtract color when isSubtract is true', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(gl, program, buffer, nodes, { [node.id]: new Set(['k1']) }, true, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 0, y: 0 }]], '#cd4422', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip a touched face key that no longer matches any current face', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'other', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(gl, program, buffer, nodes, { [node.id]: new Set(['stale']) }, false, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });
});
