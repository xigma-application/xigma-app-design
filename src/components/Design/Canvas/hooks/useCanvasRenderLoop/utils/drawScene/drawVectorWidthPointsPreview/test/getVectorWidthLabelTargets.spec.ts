// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getVectorWidthLabelTargets } from '../getVectorWidthLabelTargets';

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
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

describe('getVectorWidthLabelTargets', () => {
  it('should return an empty list when there is no active drag and nothing is selected', () => {
    // result
    expect(getVectorWidthLabelTargets(createCanvasRefs(), {})).toEqual([]);
  });

  it('should target the actively-dragged handle and its own side while resizing', () => {
    // mock
    const refs = createCanvasRefs();
    const point = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };

    refs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId: 'node-1',
      point,
      target: 'left',
    };

    // result
    expect(getVectorWidthLabelTargets(refs, {})).toEqual([{ nodeId: 'node-1', point, side: 'left' }]);
  });

  it('should also target every group-synced regulator, all on the same side as the actively-dragged handle', () => {
    // mock — a multi-selected group resize: dragging p1's left handle also syncs p2 and p3
    const refs = createCanvasRefs();
    const point = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 4 };
    const groupPoint2 = { id: 'p2', leftOffset: 4, position: 0.2, rightOffset: 4 };
    const groupPoint3 = { id: 'p3', leftOffset: 4, position: 0.8, rightOffset: 4 };

    refs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [
        { nodeId: 'node-1', point: groupPoint2 },
        { nodeId: 'node-2', point: groupPoint3 },
      ],
      isNewPoint: false,
      nodeId: 'node-1',
      point,
      target: 'left',
    };

    // result
    expect(getVectorWidthLabelTargets(refs, {})).toEqual([
      { nodeId: 'node-1', point, side: 'left' },
      { nodeId: 'node-1', point: groupPoint2, side: 'left' },
      { nodeId: 'node-2', point: groupPoint3, side: 'left' },
    ]);
  });

  it('should return an empty list while repositioning the point itself along the path, even with group targets present', () => {
    // mock
    const refs = createCanvasRefs();

    refs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [{ nodeId: 'node-1', point: { id: 'p2', leftOffset: 4, position: 0.2, rightOffset: 4 } }],
      isNewPoint: false,
      nodeId: 'node-1',
      point: { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 },
      target: 'point',
    };

    // result
    expect(getVectorWidthLabelTargets(refs, {})).toEqual([]);
  });

  it('should default to the right side of the first selected regulator when there is no active drag', () => {
    // mock
    const point = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };
    const node = buildNode({ widthProfile: { points: { p1: point } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'node-1', pointId: 'p1', side: 'point' }];

    // result
    expect(getVectorWidthLabelTargets(refs, nodes)).toEqual([{ nodeId: 'node-1', point, side: 'right' }]);
  });

  it('should use the last handle side the user grabbed for that regulator, instead of the right-side default', () => {
    // mock — the user previously grabbed p1's left diamond, so that becomes the remembered default
    const point = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };
    const node = buildNode({ widthProfile: { points: { p1: point } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'node-1', pointId: 'p1', side: 'point' }];
    refs.vectorEdit.lastVectorWidthHandleSideRef.current = { nodeId: 'node-1', pointId: 'p1', side: 'left' };

    // result
    expect(getVectorWidthLabelTargets(refs, nodes)).toEqual([{ nodeId: 'node-1', point, side: 'left' }]);
  });

  it('should ignore a remembered side that belongs to a different regulator', () => {
    // mock — the last grabbed side was p2's, but p1 is the one currently selected
    const point = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };
    const node = buildNode({ widthProfile: { points: { p1: point } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'node-1', pointId: 'p1', side: 'point' }];
    refs.vectorEdit.lastVectorWidthHandleSideRef.current = { nodeId: 'node-1', pointId: 'p2', side: 'left' };

    // result
    expect(getVectorWidthLabelTargets(refs, nodes)).toEqual([{ nodeId: 'node-1', point, side: 'right' }]);
  });

  it('should ignore drag over selection while a drag is active', () => {
    // mock — a selection exists, but the active drag on a different point takes priority
    const node = buildNode({ widthProfile: { points: { p2: { id: 'p2', leftOffset: 1, position: 0.9, rightOffset: 1 } } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();
    const dragPoint = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };

    refs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'node-1', pointId: 'p2', side: 'point' }];
    refs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId: 'node-1',
      point: dragPoint,
      target: 'right',
    };

    // result
    expect(getVectorWidthLabelTargets(refs, nodes)).toEqual([{ nodeId: 'node-1', point: dragPoint, side: 'right' }]);
  });

  it('should return an empty list when the selected regulator’s node can no longer be resolved', () => {
    // mock
    const refs = createCanvasRefs();

    refs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'missing-node', pointId: 'p1', side: 'point' }];

    // result
    expect(getVectorWidthLabelTargets(refs, {})).toEqual([]);
  });

  it('should return an empty list when the selected regulator’s point no longer exists on its node', () => {
    // mock — the node exists but the referenced point id was since removed
    const node = buildNode({ widthProfile: { points: {} } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'node-1', pointId: 'p1', side: 'point' }];

    // result
    expect(getVectorWidthLabelTargets(refs, nodes)).toEqual([]);
  });

  it('should hide the selected regulator’s label while that same regulator’s value is being edited inline', () => {
    // mock
    const point = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };
    const node = buildNode({ widthProfile: { points: { p1: point } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'node-1', pointId: 'p1', side: 'point' }];
    refs.vectorWidth.editingWidthLabelRef.current = { nodeId: 'node-1', pointId: 'p1' };

    // result
    expect(getVectorWidthLabelTargets(refs, nodes)).toEqual([]);
  });

  it('should still show the label when a different regulator is the one being edited', () => {
    // mock
    const point = { id: 'p1', leftOffset: 4, position: 0.5, rightOffset: 6 };
    const node = buildNode({ widthProfile: { points: { p1: point } } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };
    const refs = createCanvasRefs();

    refs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId: 'node-1', pointId: 'p1', side: 'point' }];
    refs.vectorWidth.editingWidthLabelRef.current = { nodeId: 'node-1', pointId: 'p2' };

    // result
    expect(getVectorWidthLabelTargets(refs, nodes)).toEqual([{ nodeId: 'node-1', point, side: 'right' }]);
  });
});
