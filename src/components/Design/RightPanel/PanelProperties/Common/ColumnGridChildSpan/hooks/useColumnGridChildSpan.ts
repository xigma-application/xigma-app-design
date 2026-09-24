// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

// utils
import { clampGridChildSpan } from './utils/clampGridChildSpan';
import { commitGridChildColumnSpanChange } from './utils/commitGridChildColumnSpanChange';
import { commitGridChildRowSpanChange } from './utils/commitGridChildRowSpanChange';
import { getGridChildSpanBounds } from './utils/getGridChildSpanBounds/getGridChildSpanBounds';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export type TUseColumnGridChildSpanResult = {
  columnSpan: string;
  isGridChild: boolean;
  maxColumnSpan: number;
  maxRowSpan: number;
  onCommitColumnSpan: (raw: string) => boolean;
  onCommitRowSpan: (raw: string) => boolean;
  rowSpan: string;
};

export const useColumnGridChildSpan = (): TUseColumnGridChildSpanResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const [selectedNode] = selectedNodes;
  const node = selectedNodes.length === 1 && isBoxSceneNode(selectedNode) ? selectedNode : undefined;
  const parentNode = node?.parentId ? nodes[node.parentId] : undefined;
  const frameNode = parentNode?.type === NodeType.frame && parentNode.layoutMode === LayoutMode.grid ? parentNode : undefined;
  const isGridChild = Boolean(frameNode);
  const bounds = frameNode && node ? getGridChildSpanBounds(frameNode, nodes, node.id) : { maxColumnSpan: 1, maxRowSpan: 1 };
  const maxColumnSpan = bounds.maxColumnSpan;
  const maxRowSpan = bounds.maxRowSpan;
  const columnSpan = Math.max(Math.round(node?.gridColumnSpan ?? 1), 1);
  const rowSpan = Math.max(Math.round(node?.gridRowSpan ?? 1), 1);

  const createSpanCommit =
    (maxSpan: number, currentSpan: number, commit: typeof commitGridChildColumnSpanChange) =>
    (raw: string): boolean => {
      const next = clampGridChildSpan(raw, maxSpan);

      if (next !== null) {
        if (next !== currentSpan) {
          commit(dispatch, node, next);
        }

        return true;
      }

      return false;
    };

  const onCommitColumnSpan = createSpanCommit(maxColumnSpan, columnSpan, commitGridChildColumnSpanChange);
  const onCommitRowSpan = createSpanCommit(maxRowSpan, rowSpan, commitGridChildRowSpanChange);

  return {
    columnSpan: String(columnSpan),
    isGridChild,
    maxColumnSpan,
    maxRowSpan,
    onCommitColumnSpan,
    onCommitRowSpan,
    rowSpan: String(rowSpan),
  };
};
