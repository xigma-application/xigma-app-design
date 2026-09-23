// store
import { addNodes, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { getAutoLayoutSyncChildren } from 'store/design/utils/autoLayout/syncAutoLayoutChildren/getAutoLayoutSyncChildren';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { getFlowAxisMove, TFlowAxisMove } from '../../getFlowAxisMove';
import { getFlowLineGroupsForOrder } from '../../getFlowLineGroupsForOrder';
import { handleForwardOrPrimaryReorder } from '../handleForwardOrPrimaryReorder';

let seq = 0;

type TFlowChildSpec = { id: string; width?: number };

type TForwardContext = {
  axisMove: TFlowAxisMove;
  lineGroups: string[][];
  orderedSelectedIds: string[];
  siblingLineGroups: string[][];
  sizesById: Map<string, TAutoLayoutChildSize>;
};

const setupFlowFrame = (children: TFlowChildSpec[]): { frameId: string } => {
  seq += 1;

  const frameId = `forward-reorder-frame-${seq}`;

  store.dispatch(
    addNodes({
      nodes: [
        {
          childIds: children.map((child) => child.id),
          clipContent: true,
          fill: '#fff',
          height: 100,
          id: frameId,
          layoutMode: LayoutMode.horizontal,
          layoutWrap: false,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width: 400,
          x: 0,
          y: 0,
        },
        ...children.map((child) => ({
          fill: '#000',
          height: 20,
          id: child.id,
          name: 'Rectangle',
          parentId: frameId,
          rotation: 0,
          type: NodeType.rectangle,
          width: child.width ?? 20,
          x: 0,
          y: 0,
        })),
      ] as any,
      rootIds: [frameId],
    }),
  );

  return { frameId };
};

const buildContext = (frame: TFrameNode, nodesById: Record<string, TSceneNode>, selectedIds: string[], deltaX: number): TForwardContext => {
  const axisMove = getFlowAxisMove(LayoutMode.horizontal, deltaX, 0)!;
  const { sizes } = getAutoLayoutSyncChildren(frame, nodesById);
  const sizesById = new Map<string, TAutoLayoutChildSize>(sizes.map((size) => [size.id, size]));
  const flowIds = sizes.map((size) => size.id);
  const lineGroups = getFlowLineGroupsForOrder(frame, sizesById, flowIds);
  const selectedIdSet = new Set(selectedIds);
  const orderedSelectedIds = flowIds.filter((id) => selectedIdSet.has(id));
  const siblingLineGroups = getFlowLineGroupsForOrder(
    frame,
    sizesById,
    flowIds.filter((id) => !selectedIdSet.has(id)),
  );

  return { axisMove, lineGroups, orderedSelectedIds, siblingLineGroups, sizesById };
};

const childIds = (frameId: string): string[] => (selectActivePage(store.getState()).nodes[frameId] as TFrameNode).childIds;

describe('handleForwardOrPrimaryReorder', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should dispatch a swap with its next neighbor on a valid forward move', () => {
    // before
    const { frameId } = setupFlowFrame([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    const nodesById = selectActivePage(store.getState()).nodes as unknown as Record<string, TSceneNode>;
    const frame = nodesById[frameId] as TFrameNode;
    const ctx = buildContext(frame, nodesById, ['a'], 1);

    // action
    handleForwardOrPrimaryReorder(
      store.dispatch,
      createCanvasRefs(),
      frame,
      ctx.sizesById,
      ctx.orderedSelectedIds,
      ctx.lineGroups,
      ctx.siblingLineGroups,
      ctx.axisMove,
    );

    // result
    expect(childIds(frameId)).toEqual(['b', 'a', 'c']);
  });

  it('should not dispatch anything when the move is blocked at the edge of the line', () => {
    // before
    const { frameId } = setupFlowFrame([{ id: 'a' }, { id: 'b' }]);
    const nodesById = selectActivePage(store.getState()).nodes as unknown as Record<string, TSceneNode>;
    const frame = nodesById[frameId] as TFrameNode;
    const ctx = buildContext(frame, nodesById, ['b'], 1);

    // action
    handleForwardOrPrimaryReorder(
      store.dispatch,
      createCanvasRefs(),
      frame,
      ctx.sizesById,
      ctx.orderedSelectedIds,
      ctx.lineGroups,
      ctx.siblingLineGroups,
      ctx.axisMove,
    );

    // result
    expect(childIds(frameId)).toEqual(['a', 'b']);
  });
});
