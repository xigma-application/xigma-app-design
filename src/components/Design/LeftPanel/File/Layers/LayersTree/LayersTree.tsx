import { FC } from 'react';

// components
import { Tree } from 'shared';

// hooks
import { useDeselectOnEmptyClick } from './hooks/useDeselectOnEmptyClick';
import { useHandleReorder } from './hooks/useHandleReorder';
import { useIsRowHighlighted } from './hooks/useIsRowHighlighted';
import { useIsRowSelected } from './hooks/useIsRowSelected';
import { useRenderDropIndicator } from './hooks/useRenderDropIndicator';
import { useRenderRow } from './hooks/useRenderRow';
import { useTreeSource } from './hooks/useTreeSource';

// utils
import { isAutoLayoutFrame } from 'utils/canvas/signals/isAutoLayoutFrame';

// others
import { LAYERS_TREE_ROW_HEIGHT } from '../constants';

// styles
import styles from './layers-tree.module.scss';

export type TLayersTreeProps = {
  expandedIds?: Set<string>;
  onExpandedIdsChange?: (next: Set<string>) => void;
};

const LayersTree: FC<TLayersTreeProps> = ({ expandedIds, onExpandedIdsChange }) => {
  const { getChildren, roots } = useTreeSource();
  const handleDeselectOnEmptyClick = useDeselectOnEmptyClick();
  const renderRow = useRenderRow();
  const renderDropIndicator = useRenderDropIndicator();
  const isRowSelected = useIsRowSelected();
  const isRowHighlighted = useIsRowHighlighted();
  const handleReorder = useHandleReorder();

  return (
    <div className={styles.LayersTree}>
      <Tree
        expandedIds={expandedIds}
        getChildren={getChildren}
        isForwardOrderParent={(parentItem) => parentItem !== null && isAutoLayoutFrame(parentItem)}
        isRowHighlighted={isRowHighlighted}
        isRowSelected={isRowSelected}
        onDeselectAll={handleDeselectOnEmptyClick}
        onExpandedIdsChange={onExpandedIdsChange}
        onReorder={handleReorder}
        renderDropIndicator={renderDropIndicator}
        renderRow={renderRow}
        roots={roots}
        rowHeight={LAYERS_TREE_ROW_HEIGHT}
      />
    </div>
  );
};

export default LayersTree;
