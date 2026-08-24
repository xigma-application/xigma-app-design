// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorWidthPointsForNode } from '../drawVectorWidthPointsForNode';

const bakeVectorNodeRotationMock = vi.fn();
const drawWidthPointHandlesMock = vi.fn();

vi.mock('components/Design/Canvas/utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (...args: unknown[]): unknown => bakeVectorNodeRotationMock(...args),
}));
vi.mock('../drawWidthPointHandles', () => ({
  drawWidthPointHandles: (...args: unknown[]): void => drawWidthPointHandlesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
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
  ...overrides,
});

describe('drawVectorWidthPointsForNode', () => {
  beforeEach(() => {
    bakeVectorNodeRotationMock.mockImplementation((node: TVectorNode) => ({ segments: node.segments, vertices: node.vertices }));
    drawWidthPointHandlesMock.mockClear();
  });

  it('should draw handles for every committed width point on the given editing node', () => {
    // mock
    const node = buildNode({
      widthProfile: {
        points: {
          p1: { id: 'p1', leftOffset: 4, position: 0.2, rightOffset: 4 },
          p2: { id: 'p2', leftOffset: 6, position: 0.7, rightOffset: 6 },
        },
      },
    });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // before
    drawVectorWidthPointsForNode(gl, program, buffer, nodes, node.id, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawWidthPointHandlesMock).toHaveBeenCalledTimes(2);
  });

  it('should also draw an in-progress drag point live for this node', () => {
    // mock
    const node = buildNode({ widthProfile: null });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId: node.id,
      point: { id: 'p1', leftOffset: 10, position: 0.5, rightOffset: 10 },
      target: 'right',
    };

    // before
    drawVectorWidthPointsForNode(gl, program, buffer, nodes, node.id, refs, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawWidthPointHandlesMock).toHaveBeenCalledTimes(1);
  });

  it('should mark the selected side(s) of a point as selected when drawing its handles', () => {
    // mock
    const node = buildNode({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 4, position: 0.2, rightOffset: 4 } } },
    });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.selectedVectorWidthHandlesRef.current = [{ nodeId: node.id, pointId: 'p1', side: 'right' }];

    // before
    drawVectorWidthPointsForNode(gl, program, buffer, nodes, node.id, refs, 200, 150, IDENTITY_VIEWPORT);

    // result — (gl, program, buffer, bakedNode, chainOrder, widthPoint, isLeftSelected, isRightSelected, isPointSelected, ...)
    expect(drawWidthPointHandlesMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      expect.anything(),
      expect.anything(),
      node.widthProfile?.points.p1,
      false,
      true,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should mark the point itself as selected independently of its diamond handles', () => {
    // mock — clicking the center anchor selects only the 'point' side, leaving both diamonds unselected
    const node = buildNode({
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 4, position: 0.2, rightOffset: 4 } } },
    });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.selectedVectorWidthHandlesRef.current = [{ nodeId: node.id, pointId: 'p1', side: 'point' }];

    // before
    drawVectorWidthPointsForNode(gl, program, buffer, nodes, node.id, refs, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawWidthPointHandlesMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      expect.anything(),
      expect.anything(),
      node.widthProfile?.points.p1,
      false,
      false,
      true,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing when the given node id does not resolve to a vector node', () => {
    // before
    drawVectorWidthPointsForNode(gl, program, buffer, {}, 'missing', createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawWidthPointHandlesMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the baked node is not a valid non-branching chain', () => {
    // mock — an empty segments map has no chain to walk
    const node = buildNode({ segments: {}, widthProfile: { points: { p1: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 4 } } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // before
    drawVectorWidthPointsForNode(gl, program, buffer, nodes, node.id, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawWidthPointHandlesMock).not.toHaveBeenCalled();
  });
});
