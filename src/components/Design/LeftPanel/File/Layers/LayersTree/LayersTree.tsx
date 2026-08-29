import { FC, ReactNode } from 'react';

// components
import { Tree, TreeItem } from 'shared';

// hooks
import { useDeselectOnEmptyClick } from './hooks/useDeselectOnEmptyClick';
import { useReorderNode } from './hooks/useReorderNode';

// others
import { LAYERS_TREE_ROW_HEIGHT } from '../constants';

// store
import { selectOrderedNodes, selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './layers-tree.module.scss';

const LayersTree: FC = () => {
  const nodes = useAppSelector(selectOrderedNodes);
  const selectedIds = useAppSelector(selectSelectedIds);
  const handleDeselectOnEmptyClick = useDeselectOnEmptyClick();
  const handleReorderNode = useReorderNode();

  const renderRow = (index: number): ReactNode => <TreeItem isSelected={selectedIds.includes(nodes[index].id)} node={nodes[index]} />;
  const isRowSelected = (index: number): boolean => index >= 0 && index < nodes.length && selectedIds.includes(nodes[index].id);

  return (
    <div className={styles.LayersTree}>
      <Tree
        count={nodes.length}
        isRowSelected={isRowSelected}
        onDeselectAll={handleDeselectOnEmptyClick}
        onReorder={handleReorderNode}
        renderRow={renderRow}
        rowHeight={LAYERS_TREE_ROW_HEIGHT}
      />
    </div>
  );
};

export default LayersTree;
