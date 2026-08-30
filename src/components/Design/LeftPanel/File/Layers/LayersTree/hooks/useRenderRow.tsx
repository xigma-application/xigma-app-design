import { ReactNode } from 'react';

// components
import LayerRow from '../LayerRow/LayerRow';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TSceneNode } from 'types/design/types';
import { TToggleExpand, TTreeRow } from 'shared/UI/Tree/types';

export const useRenderRow = (): TFunc<[TTreeRow<TSceneNode>, TToggleExpand], ReactNode> => {
  const selectedIds = useAppSelector(selectSelectedIds);

  return (row: TTreeRow<TSceneNode>, onToggleExpand: TToggleExpand): ReactNode => (
    <LayerRow
      depth={row.depth}
      isExpanded={row.isExpanded}
      isSelected={selectedIds.includes(row.item.id)}
      node={row.item}
      onToggleExpand={onToggleExpand}
    />
  );
};
