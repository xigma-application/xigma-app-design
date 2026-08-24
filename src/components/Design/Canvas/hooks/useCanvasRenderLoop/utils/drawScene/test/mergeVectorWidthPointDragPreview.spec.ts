// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { mergeVectorWidthPointDragPreview } from '../mergeVectorWidthPointDragPreview';

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('mergeVectorWidthPointDragPreview', () => {
  it('should return the node unchanged when there is no active drag', () => {
    // mock
    const node = buildVectorNode();
    const refs = createCanvasRefs();

    // result
    expect(mergeVectorWidthPointDragPreview(refs)(node)).toBe(node);
  });

  it('should overlay the primary drag point on top of the committed points for the matching node', () => {
    // mock
    const node = buildVectorNode({ widthProfile: { points: { p0: { id: 'p0', leftOffset: 2, position: 0.5, rightOffset: 2 } } } });
    const refs = createCanvasRefs();

    refs.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId: node.id,
      point: { id: 'p1', leftOffset: 9, position: 0.3, rightOffset: 9 },
      target: 'left',
    };

    // result
    const merged = mergeVectorWidthPointDragPreview(refs)(node) as TVectorNode;

    expect(merged.widthProfile?.points).toEqual({
      p0: { id: 'p0', leftOffset: 2, position: 0.5, rightOffset: 2 },
      p1: { id: 'p1', leftOffset: 9, position: 0.3, rightOffset: 9 },
    });
  });

  it('should overlay a group target on a node other than the primary drag node', () => {
    // mock — p1 is being dragged on a different node, p2 on this node syncs along as a group target
    const node = buildVectorNode({ widthProfile: { points: { p2: { id: 'p2', leftOffset: 2, position: 0.4, rightOffset: 2 } } } });
    const refs = createCanvasRefs();

    refs.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [{ nodeId: node.id, point: { id: 'p2', leftOffset: 11, position: 0.4, rightOffset: 11 } }],
      isNewPoint: false,
      nodeId: 'other-node',
      point: { id: 'p1', leftOffset: 11, position: 0.1, rightOffset: 11 },
      target: 'right',
    };

    // result
    const merged = mergeVectorWidthPointDragPreview(refs)(node) as TVectorNode;

    expect(merged.widthProfile?.points).toEqual({ p2: { id: 'p2', leftOffset: 11, position: 0.4, rightOffset: 11 } });
  });

  it('should leave a vector node untouched when it is neither the primary drag node nor a group target', () => {
    // mock
    const node = buildVectorNode({
      id: 'unrelated-node',
      widthProfile: { points: { p0: { id: 'p0', leftOffset: 2, position: 0.5, rightOffset: 2 } } },
    });
    const refs = createCanvasRefs();

    refs.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId: 'other-node',
      point: { id: 'p1', leftOffset: 9, position: 0.3, rightOffset: 9 },
      target: 'left',
    };

    // result
    expect(mergeVectorWidthPointDragPreview(refs)(node)).toBe(node);
  });

  it('should leave a non-vector node untouched even if its id matches the primary drag node', () => {
    // mock
    const node = { ...buildVectorNode(), type: NodeType.frame } as unknown as TSceneNode;
    const refs = createCanvasRefs();

    refs.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId: node.id,
      point: { id: 'p1', leftOffset: 9, position: 0.3, rightOffset: 9 },
      target: 'left',
    };

    // result
    expect(mergeVectorWidthPointDragPreview(refs)(node)).toBe(node);
  });
});
