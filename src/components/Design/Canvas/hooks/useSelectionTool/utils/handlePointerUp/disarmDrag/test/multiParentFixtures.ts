// store
import { addNode, deleteNode, moveNodes, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

export const resetPage = (): void => {
  selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
};

export const addFrame = (layoutMode: LayoutMode | undefined, x: number, y: number, size = 300): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
      gridColumnCount: 3,
      height: size,
      layoutMode,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

export const addRoot = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
      height: size,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

export const addChildren = (frameId: string, count: number): string[] => {
  const ids = Array.from({ length: count }, () => addRoot(5000, 5000));
  ids.forEach((id, index) => store.dispatch(moveNodes({ nodeIds: [id], targetIndex: index, targetParentId: frameId })));

  return ids;
};

export const makeManualGrid = (frameId: string, anchors: { childId: string; column: number; row: number }[]): void => {
  store.dispatch(updateNode({ changes: { gridAutoPlacement: false }, id: frameId }));
  anchors.forEach(({ childId, column, row }) => {
    store.dispatch(updateNode({ changes: { gridColumnAnchorIndex: column, gridRowAnchorIndex: row }, id: childId }));
  });
};

export const readChildIds = (frameId: string): string[] =>
  (selectActivePage(store.getState()).nodes[frameId] as unknown as { childIds: string[] }).childIds;

export const readAnchor = (id: string): { column: number | undefined; row: number | undefined } => {
  const node = selectActivePage(store.getState()).nodes[id] as unknown as { gridColumnAnchorIndex?: number; gridRowAnchorIndex?: number };
  return { column: node.gridColumnAnchorIndex, row: node.gridRowAnchorIndex };
};
