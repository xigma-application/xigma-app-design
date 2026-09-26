import { useMemo, useState } from 'react';

// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSelectionColorGroup } from '../../types';
import { TOpenSelectionColorGroup, TUseSelectionColorsSectionResult } from './types';

// utils
import { collectSelectionColorGroups } from '../../utils/collectSelectionColorGroups';
import { commitSelectionColorChange } from '../../utils/commitSelectionColorChange';
import { getNextOpenGroup } from './utils/getNextOpenGroup';
import { getSelectionColorSelectionNodeIds } from '../../utils/getSelectionColorSelectionNodeIds';
import { isSelectionColorsRootNode } from '../../utils/isSelectionColorsRootNode';

const NO_GROUPS: TSelectionColorGroup[] = [];

export const useSelectionColorsSection = (): TUseSelectionColorsSectionResult => {
  const dispatch = useAppDispatch();
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const nodesById = useAppSelector(selectNodes);
  const rootNodes = useMemo(() => selectedNodes.filter(isSelectionColorsRootNode), [selectedNodes]);
  const hasChildren =
    rootNodes.length > 1 || rootNodes.some((rootNode) => rootNode.type === NodeType.vector || rootNode.childIds.length > 0);
  const [openGroup, setOpenGroup] = useState<TOpenSelectionColorGroup | null>(null);
  const groups = useMemo(
    () => (rootNodes.length > 0 ? collectSelectionColorGroups(rootNodes, nodesById, openGroup?.occurrences ?? null) : NO_GROUPS),
    [rootNodes, nodesById, openGroup],
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
