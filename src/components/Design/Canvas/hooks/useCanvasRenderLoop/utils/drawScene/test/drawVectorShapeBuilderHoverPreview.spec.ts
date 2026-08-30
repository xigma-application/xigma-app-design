// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorShapeBuilderHoverPreview } from '../drawVectorShapeBuilderHoverPreview';

const bakeVectorNodeRotationMock = vi.fn();
const deriveVectorFacesMock = vi.fn();
const drawVectorHatchFillMock = vi.fn();
const groupCrossingVectorNodesMock = vi.fn();
const getVectorFacesOnPathMock = vi.fn();
const getVectorFacesInRectMock = vi.fn();

vi.mock('components/Design/Canvas/utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (...args: unknown[]): unknown => bakeVectorNodeRotationMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces', () => ({
  deriveVectorFaces: (...args: unknown[]): unknown => deriveVectorFacesMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorHatchFill', () => ({
  drawVectorHatchFill: (...args: unknown[]): void => drawVectorHatchFillMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/mergeVectorNodes/groupCrossingVectorNodes', () => ({
  groupCrossingVectorNodes: (...args: unknown[]): unknown => groupCrossingVectorNodesMock(...args),
}));
vi.mock('components/Design/Canvas/utils/getVectorFacesOnPath', () => ({
  getVectorFacesOnPath: (...args: unknown[]): unknown => getVectorFacesOnPathMock(...args),
}));
vi.mock('components/Design/Canvas/utils/getVectorFacesInRect', () => ({
  getVectorFacesInRect: (...args: unknown[]): unknown => getVectorFacesInRectMock(...args),
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
    groupCrossingVectorNodesMock.mockReset();
    getVectorFacesOnPathMock.mockReset();
    getVectorFacesInRectMock.mockReset();
  });

  it('should draw nothing when nothing is touched', () => {
    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      [node.id],
      [node.id],
      {},
      false,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a touched node id that no longer resolves to any node', () => {
    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      [node.id],
      [node.id],
      { missing: new Set(['k1']) },
      false,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

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
      [node.id],
      [node.id],
      { [node.id]: new Set(['k1', 'k2']) },
      false,
      null,
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
      '#337ae1',
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
      '#337ae1',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should hatch-fill in the subtract color when isSubtract is true', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      [node.id],
      [node.id],
      { [node.id]: new Set(['k1']) },
      true,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 0, y: 0 }]], '#cd4422', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip a touched face key that no longer matches any current face', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'other', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      [node.id],
      [node.id],
      { [node.id]: new Set(['stale']) },
      false,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should still use the plain per-node hatch when 2+ nodes are touched but no drag path is active yet (idle hover)', () => {
    // mock — 2 touched node ids, but path is null (no drag in progress) — must NOT attempt grouping
    const otherNode: TVectorNode = { ...node, id: '2' };
    const twoNodes: Record<string, TSceneNode> = { ...nodes, [otherNode.id]: otherNode };

    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      twoNodes,
      [node.id, otherNode.id],
      [node.id, otherNode.id],
      { [node.id]: new Set(['k1']), [otherNode.id]: new Set(['k1']) },
      false,
      null,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — plain per-node hatch ran twice (once per node), not the grouping path
    expect(drawVectorHatchFillMock).toHaveBeenCalledTimes(2);
    expect(groupCrossingVectorNodesMock).not.toHaveBeenCalled();
  });

  it('should re-hit-test the freeform path against a crossing group’s combined node and hatch the result, when 2+ nodes are touched mid-drag', () => {
    // mock — 2 touched nodes, grouped into one crossing pair
    const otherNode: TVectorNode = { ...node, id: '2' };
    const twoNodes: Record<string, TSceneNode> = { ...nodes, [otherNode.id]: otherNode };
    const combinedNode = { ...node, id: 'combined' };
    const path = [{ x: 5, y: 5 }];

    groupCrossingVectorNodesMock.mockReturnValue([{ combinedNode, nodeIds: [node.id, otherNode.id] }]);
    getVectorFacesOnPathMock.mockReturnValue([{ key: 'split-face', points: [{ x: 9, y: 9 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      twoNodes,
      [node.id, otherNode.id],
      [node.id, otherNode.id],
      { [node.id]: new Set(['k1']), [otherNode.id]: new Set(['k1']) },
      false,
      path,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(getVectorFacesOnPathMock).toHaveBeenCalledWith(combinedNode, path);
    expect(getVectorFacesInRectMock).not.toHaveBeenCalled();
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 9, y: 9 }]], '#337ae1', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should re-hit-test a box rect (not the raw path) against the combined node when isBoxMode is true', () => {
    // mock
    const otherNode: TVectorNode = { ...node, id: '2' };
    const twoNodes: Record<string, TSceneNode> = { ...nodes, [otherNode.id]: otherNode };
    const combinedNode = { ...node, id: 'combined' };
    const path = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];

    groupCrossingVectorNodesMock.mockReturnValue([{ combinedNode, nodeIds: [node.id, otherNode.id] }]);
    getVectorFacesInRectMock.mockReturnValue([{ key: 'split-face', points: [{ x: 5, y: 5 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      twoNodes,
      [node.id, otherNode.id],
      [node.id, otherNode.id],
      { [node.id]: new Set(['k1']), [otherNode.id]: new Set(['k1']) },
      false,
      path,
      true,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(getVectorFacesOnPathMock).not.toHaveBeenCalled();
    expect(getVectorFacesInRectMock).toHaveBeenCalledWith(combinedNode, { height: 10, width: 10, x: 0, y: 0 });
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 5, y: 5 }]], '#337ae1', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should fall back to the plain per-node hatch for a group that turned out to be a singleton (touched nodes that don’t actually cross)', () => {
    // mock — 2 touched node ids, but grouping decided they never actually cross, so each stays its own
    // singleton group
    const otherNode: TVectorNode = { ...node, id: '2' };
    const twoNodes: Record<string, TSceneNode> = { ...nodes, [otherNode.id]: otherNode };
    const path = [{ x: 5, y: 5 }];

    groupCrossingVectorNodesMock.mockReturnValue([
      { combinedNode: node, nodeIds: [node.id] },
      { combinedNode: otherNode, nodeIds: [otherNode.id] },
    ]);
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      twoNodes,
      [node.id, otherNode.id],
      [node.id, otherNode.id],
      { [node.id]: new Set(['k1']), [otherNode.id]: new Set(['k1']) },
      false,
      path,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — the grouping path ran, but each singleton falls back to the plain per-node hatch
    expect(getVectorFacesOnPathMock).not.toHaveBeenCalled();
    expect(drawVectorHatchFillMock).toHaveBeenCalledTimes(2);
  });

  it('should re-hit-test against the combined node even when only ONE node is touched, as long as it crosses an untouched open neighbor — live-caught regression: Alt-clicking only the exclusive corner of a shape that crosses an untouched one used to treat it as fully isolated', () => {
    // mock — only node.id is touched; otherNode is open (in vectorEditingNodeIds) but was never
    // itself touched by the path, yet grouping still finds them crossing
    const otherNode: TVectorNode = { ...node, id: '2' };
    const twoNodes: Record<string, TSceneNode> = { ...nodes, [otherNode.id]: otherNode };
    const combinedNode = { ...node, id: 'combined' };
    const path = [{ x: 5, y: 5 }];

    groupCrossingVectorNodesMock.mockReturnValue([{ combinedNode, nodeIds: [node.id, otherNode.id] }]);
    getVectorFacesOnPathMock.mockReturnValue([{ key: 'split-face', points: [{ x: 9, y: 9 }] }]);

    // before
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      twoNodes,
      [node.id, otherNode.id],
      [node.id, otherNode.id],
      { [node.id]: new Set(['k1']) },
      false,
      path,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(groupCrossingVectorNodesMock).toHaveBeenCalledWith([node, otherNode]); // grouped over every open node, not just touched
    expect(getVectorFacesOnPathMock).toHaveBeenCalledWith(combinedNode, path);
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 9, y: 9 }]], '#337ae1', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should skip a crossing group entirely when none of its members were actually touched, even while a different node elsewhere in the same gesture was', () => {
    // mock — node.id is touched (satisfies the outer gate on its own), but otherNode+thirdNode form
    // their own separate crossing group that this gesture never touched at all
    const otherNode: TVectorNode = { ...node, id: '2' };
    const thirdNode: TVectorNode = { ...node, id: '3' };
    const threeNodes: Record<string, TSceneNode> = { ...nodes, [otherNode.id]: otherNode, [thirdNode.id]: thirdNode };
    const untouchedCombinedNode = { ...node, id: 'combined' };
    const path = [{ x: 5, y: 5 }];

    groupCrossingVectorNodesMock.mockReturnValue([
      { combinedNode: node, nodeIds: [node.id] },
      { combinedNode: untouchedCombinedNode, nodeIds: [otherNode.id, thirdNode.id] },
    ]);
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before — only node.id appears in touchedFaces
    drawVectorShapeBuilderHoverPreview(
      gl,
      program,
      buffer,
      threeNodes,
      [node.id, otherNode.id, thirdNode.id],
      [node.id, otherNode.id, thirdNode.id],
      { [node.id]: new Set(['k1']) },
      false,
      path,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — the touched singleton group hatches normally; the untouched crossing pair is skipped
    expect(getVectorFacesOnPathMock).not.toHaveBeenCalled();
    expect(drawVectorHatchFillMock).toHaveBeenCalledTimes(1);
  });
});
