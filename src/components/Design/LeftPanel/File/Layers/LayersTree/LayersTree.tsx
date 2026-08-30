import { FC } from 'react';

// components
import { Tree } from 'shared';

// hooks
import { useDeselectOnEmptyClick } from './hooks/useDeselectOnEmptyClick';
import { useHandleReorder } from './hooks/useHandleReorder';
import { useIsRowSelected } from './hooks/useIsRowSelected';
import { useRenderDropIndicator } from './hooks/useRenderDropIndicator';
import { useRenderRow } from './hooks/useRenderRow';
import { useTreeSource } from './hooks/useTreeSource';

// others
import { LAYERS_TREE_ROW_HEIGHT } from '../constants';

// styles
import styles from './layers-tree.module.scss';

const LayersTree: FC = () => {
  const { getChildren, roots } = useTreeSource();
  const handleDeselectOnEmptyClick = useDeselectOnEmptyClick();
  const renderRow = useRenderRow();
  const renderDropIndicator = useRenderDropIndicator();
  const isRowSelected = useIsRowSelected();
  const handleReorder = useHandleReorder();

  return (
    <div className={styles.LayersTree}>
      <Tree
        getChildren={getChildren}
        isRowSelected={isRowSelected}
        onDeselectAll={handleDeselectOnEmptyClick}
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
