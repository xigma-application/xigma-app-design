import { FocusEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// hooks
import { usePositionCommit } from './usePositionCommit';

// others
import { translationNameSpace } from '../../constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { commitColumnX } from './utils/commitColumnX';
import { commitColumnY } from './utils/commitColumnY';
import { getMixedOrValue } from 'components/Design/RightPanel/PanelProperties/Common/utils/getMixedOrValue';
import { getPositionEntry, TPositionEntry } from './utils/getPositionEntry';
import { isExistingBoxSceneNode } from 'components/Design/Canvas/utils/isExistingBoxSceneNode';
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const boxNodes = useAppSelector(selectSelectedNodes).filter(isExistingBoxSceneNode);
  const imageCrop = useAppSelector(selectSelectedImageCrop);
  const entries = (imageCrop ? boxNodes.slice(0, 1) : boxNodes).map((boxNode) => getPositionEntry(boxNode, nodes, imageCrop));
  const [node] = boxNodes;
  const [entry] = entries;
  const id = node?.id ?? '';
  const x = entry?.x ?? 0;
  const y = entry?.y ?? 0;
  const mixedLabel = t(`${translationNameSpace}.mixed`);
  const mixedX = entries.length > 1 ? getMixedOrValue(entries.map((item) => item.x)) : x;
  const mixedY = entries.length > 1 ? getMixedOrValue(entries.map((item) => item.y)) : y;
  const managed = isManagedLayoutFrame(entry?.parent);
  const ignoresAutoLayout = Boolean(node?.ignoreAutoLayout);
  const displayX = mixedX === 'mixed' ? mixedLabel : mixedX;
  const displayY = mixedY === 'mixed' ? mixedLabel : mixedY;

  const commitX = (nextX: number): void =>
    entries.filter((item) => !item.disabledX).forEach((item) => commitColumnX(dispatch, imageCrop, item.id, item.parent, item.y, nextX));
  const commitY = (nextY: number): void =>
    entries.filter((item) => !item.disabledY).forEach((item) => commitColumnY(dispatch, imageCrop, item.id, item.parent, item.x, nextY));

  const scrubStartRef = useRef<{ entries: TPositionEntry[]; x: number; y: number }>({ entries: [], x: 0, y: 0 });

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
    onBlurX: usePositionCommit(displayX, commitOnBlur(commitX)),
    onBlurY: usePositionCommit(displayY, commitOnBlur(commitY)),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: startScrub,
    onScrubX: scrubX,
    onScrubY: scrubY,
    onToggleIgnoreAutoLayout: () => dispatch(updateNode({ changes: { ignoreAutoLayout: ignoresAutoLayout ? undefined : true }, id })),
    showIgnoreAutoLayoutToggle: managed && !imageCrop,
    x,
    y,
  };
};
