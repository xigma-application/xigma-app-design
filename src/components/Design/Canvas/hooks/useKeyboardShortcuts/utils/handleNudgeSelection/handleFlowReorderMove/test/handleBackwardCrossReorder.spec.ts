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
import { handleBackwardCrossReorder } from '../handleBackwardCrossReorder';

let seq = 0;

type TFlowChildSpec = { id: string; width?: number };

type TBackwardContext = {
  axisMove: TFlowAxisMove;
  flowIds: string[];
  lineGroups: string[][];
  orderedSelectedIds: string[];
  selectedIdSet: Set<string>;
  sizesById: Map<string, TAutoLayoutChildSize>;
};

const setupWrappingFlowFrame = (frameWidth: number, children: TFlowChildSpec[]): { frameId: string } => {
  seq += 1;

  const frameId = `backward-cross-reorder-frame-${seq}`;

  store.dispatch(
    addNodes({
      nodes: [
        {
          childIds: children.map((child) => child.id),
          clipContent: true,
          fill: '#fff',
          height: 200,
          id: frameId,
          layoutMode: LayoutMode.horizontal,
          layoutWrap: true,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width: frameWidth,
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

const buildContext = (frame: TFrameNode, nodesById: Record<string, TSceneNode>, selectedIds: string[]): TBackwardContext => {
  const axisMove = getFlowAxisMove(LayoutMode.horizontal, 0, -1)!;
  const { sizes } = getAutoLayoutSyncChildren(frame, nodesById);
  const sizesById = new Map<string, TAutoLayoutChildSize>(sizes.map((size) => [size.id, size]));
  const flowIds = sizes.map((size) => size.id);
  const lineGroups = getFlowLineGroupsForOrder(frame, sizesById, flowIds);
  const selectedIdSet = new Set(selectedIds);
  const orderedSelectedIds = flowIds.filter((id) => selectedIdSet.has(id));

  return { axisMove, flowIds, lineGroups, orderedSelectedIds, selectedIdSet, sizesById };
};

const childIds = (frameId: string): string[] => (selectActivePage(store.getState()).nodes[frameId] as TFrameNode).childIds;

const move = (frameId: string, selectedIds: string[]): void => {
  const nodesById = selectActivePage(store.getState()).nodes as unknown as Record<string, TSceneNode>;
  const frame = nodesById[frameId] as TFrameNode;
  const ctx = buildContext(frame, nodesById, selectedIds);

  handleBackwardCrossReorder(
    store.dispatch,
    createCanvasRefs(),
    frame,
    ctx.sizesById,
    ctx.flowIds,
    ctx.orderedSelectedIds,
    ctx.selectedIdSet,
    ctx.lineGroups,
    ctx.axisMove,
  );
};

describe('handleBackwardCrossReorder', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should evict row 0’s trailing item to make room when the row is exactly full', () => {
    // before — two 100px-wide children per row, filling the 200px row exactly (zero slack)
    const { frameId } = setupWrappingFlowFrame(200, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
      { id: 'c', width: 100 },
      { id: 'd', width: 100 },
    ]);

    // action
    move(frameId, ['d']);

    // result — 'd' crosses into row 0 (now [a,d]); 'b' is pushed forward to join 'c' in row 1
    expect(childIds(frameId)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('should not dispatch anything when the selection is already in the first row', () => {
    // before — no previous row to cross into
    const { frameId } = setupWrappingFlowFrame(220, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
    ]);

    // action
    move(frameId, ['a']);

    // result — nothing moves
    expect(childIds(frameId)).toEqual(['a', 'b']);
  });
});
