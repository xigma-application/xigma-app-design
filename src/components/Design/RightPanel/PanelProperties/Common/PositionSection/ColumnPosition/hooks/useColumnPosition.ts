import { FocusEvent, useRef } from 'react';

// hooks
import { usePositionCommit } from './usePositionCommit';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { TPositionScrubStart } from '../types';

// utils
import { commitColumnX } from './utils/commitColumnX';
import { commitColumnY } from './utils/commitColumnY';
import { getMixedOrValue } from 'components/Design/RightPanel/PanelProperties/Common/utils/getMixedOrValue';
import { getPositionEntry } from './utils/getPositionEntry';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isExistingTransformPanelNode } from 'components/Design/RightPanel/PanelProperties/Common/utils/isExistingTransformPanelNode';
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';
import { selectSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';

export type TUseColumnPositionResult = {
  disabledX: boolean;
  disabledY: boolean;
  displayX: number | string;
  displayY: number | string;
  ignoresAutoLayout: boolean;
  onBlurX: TFunc<[FocusEvent<HTMLInputElement>]>;
  onBlurY: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrubX: TFunc<[number]>;
  onScrubY: TFunc<[number]>;
  onToggleIgnoreAutoLayout: TFunc;
  showIgnoreAutoLayoutToggle: boolean;
  x: number;
  y: number;
};

export const useColumnPosition = (): TUseColumnPositionResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const boxNodes = useAppSelector(selectSelectedNodes).filter(isExistingTransformPanelNode);
  const imageCrop = useAppSelector(selectSelectedImageCrop);
  const entries = (imageCrop ? boxNodes.slice(0, 1) : boxNodes).map((boxNode) => getPositionEntry(boxNode, nodes, imageCrop));
  const [node] = boxNodes;
  const [entry] = entries;
  const id = node?.id ?? '';
  const x = entry?.x ?? 0;
  const y = entry?.y ?? 0;
  const mixedX = entries.length > 1 ? getMixedOrValue(entries.map((item) => item.x)) : x;
  const mixedY = entries.length > 1 ? getMixedOrValue(entries.map((item) => item.y)) : y;
  const managed = isManagedLayoutFrame(node?.parentId ? nodes[node.parentId] : undefined);
  const ignoresAutoLayout = Boolean(node && isBoxSceneNode(node) && node.ignoreAutoLayout);
  const displayX = mixedX === 'mixed' ? MIXED_LABEL : mixedX;
  const displayY = mixedY === 'mixed' ? MIXED_LABEL : mixedY;
  const scrubStartRef = useRef<TPositionScrubStart>({ entries: [], x: 0, y: 0 });

  const commitX = (nextX: number): void =>
    entries.filter((item) => !item.disabledX).forEach((item) => commitColumnX(dispatch, imageCrop, item.id, item.parent, item.y, nextX));

  const commitY = (nextY: number): void =>
    entries.filter((item) => !item.disabledY).forEach((item) => commitColumnY(dispatch, imageCrop, item.id, item.parent, item.x, nextY));

  const scrubX = (nextX: number): void => {
    if (entries.length > 1) {
      const start = scrubStartRef.current;

      start.entries
        .filter((item) => !item.disabledX)
        .forEach((item) => commitColumnX(dispatch, imageCrop, item.id, item.parent, item.y, item.x + nextX - start.x));
    } else {
      commitX(nextX);
    }
  };

  const scrubY = (nextY: number): void => {
    if (entries.length > 1) {
      const start = scrubStartRef.current;

      start.entries
        .filter((item) => !item.disabledY)
        .forEach((item) => commitColumnY(dispatch, imageCrop, item.id, item.parent, item.x, item.y + nextY - start.y));
    } else {
      commitY(nextY);
    }
  };

  const startScrub = (): void => {
    scrubStartRef.current = { entries, x, y };
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  };

  const getCommittedDisplayValue = (axis: 'x' | 'y'): number | string => {
    const freshNodes = selectNodes(store.getState());
    const freshEntries = boxNodes
      .map((boxNode) => freshNodes[boxNode.id])
      .filter(isExistingTransformPanelNode)
      .map((boxNode) => getPositionEntry(boxNode, freshNodes, imageCrop));
    const mixedOrValue = getMixedOrValue(freshEntries.map((item) => item[axis]));

    return mixedOrValue === 'mixed' ? MIXED_LABEL : mixedOrValue;
  };

  const commitOnBlur =
    (commit: TFunc<[number]>): TFunc<[number]> =>
    (next): void => {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      commit(next);
      dispatch(endHistoryGesture());
    };

  return {
    disabledX: entries.length > 0 && entries.every((item) => item.disabledX),
    disabledY: entries.length > 0 && entries.every((item) => item.disabledY),
    displayX,
    displayY,
    ignoresAutoLayout,
    onBlurX: usePositionCommit(
      displayX,
      commitOnBlur(commitX),
      entries.length > 1 ? (): number | string => getCommittedDisplayValue('x') : undefined,
    ),
    onBlurY: usePositionCommit(
      displayY,
      commitOnBlur(commitY),
      entries.length > 1 ? (): number | string => getCommittedDisplayValue('y') : undefined,
    ),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: startScrub,
    onScrubX: scrubX,
    onScrubY: scrubY,
    onToggleIgnoreAutoLayout: () => dispatch(updateNode({ changes: { ignoreAutoLayout: ignoresAutoLayout ? undefined : true }, id })),
    showIgnoreAutoLayoutToggle: managed && !imageCrop && node !== undefined && isBoxSceneNode(node),
    x,
    y,
  };
};
