import { useMemo, useState } from 'react';

// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TSelectionColorGroup } from '../../types';
import { TOpenSelectionColorGroup, TUseSelectionColorsSectionResult } from './types';

// utils
import { collectSelectionColorGroups } from '../../utils/collectSelectionColorGroups';
import { commitSelectionColorChange } from '../../utils/commitSelectionColorChange';
import { getNextOpenGroup } from './utils/getNextOpenGroup';
import { getSelectionColorSelectionNodeIds } from '../../utils/getSelectionColorSelectionNodeIds';
import { isFrameNode } from 'utils/canvas/signals/isFrameNode';

const NO_GROUPS: TSelectionColorGroup[] = [];

export const useSelectionColorsSection = (): TUseSelectionColorsSectionResult => {
  const dispatch = useAppDispatch();
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const nodesById = useAppSelector(selectNodes);
  const frames = useMemo(() => selectedNodes.filter(isFrameNode), [selectedNodes]);
  const hasChildren = frames.length > 1 || frames.some((frame) => frame.childIds.length > 0);
  const [openGroup, setOpenGroup] = useState<TOpenSelectionColorGroup | null>(null);
  const groups = useMemo(
    () => (frames.length > 0 ? collectSelectionColorGroups(frames, nodesById, openGroup?.occurrences ?? null) : NO_GROUPS),
    [frames, nodesById, openGroup],
  );

  return {
    getSelectionCount: (occurrences): number => getSelectionColorSelectionNodeIds(occurrences, nodesById).length,
    groups,
    hasChildren,
    onChange: (occurrences, nextPaint): void => commitSelectionColorChange(dispatch, nodesById, occurrences, nextPaint),
    onOpenChange: (group, isOpen): void => setOpenGroup(getNextOpenGroup(openGroup, group, isOpen)),
    onSelectNodes: (occurrences): void => {
      dispatch(setSelection(getSelectionColorSelectionNodeIds(occurrences, nodesById)));
    },
    openGroupKey: openGroup?.key ?? null,
  };
};
