import { FC, ReactNode, useRef } from 'react';

// components
import LayersHeaderTitle from './LayersHeaderTitle/LayersHeaderTitle';
import { Tree, TreeItem } from 'shared';

// hooks
import { useDeselectOnEmptyClick } from './hooks/useDeselectOnEmptyClick';
import { useHandleTreeResizeMouseDown } from './hooks/useHandleTreeResizeMouseDown';
import { useResizeHandler } from 'hooks';
import { useToggleLayersExpanded } from './hooks/useToggleLayersExpanded';

// others
import { LAYERS_TREE_RESIZE_SETTINGS, LAYERS_TREE_ROW_HEIGHT } from './constants';

// store
import { selectOrderedNodes, selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './layers.module.scss';

// utils
import { getMaxLayersTreeHeight } from './utils/getMaxLayersTreeHeight';

const Layers: FC = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const nodes = useAppSelector(selectOrderedNodes);
  const selectedIds = useAppSelector(selectSelectedIds);
  const maxHeight = getMaxLayersTreeHeight();
  const { handleToggleClick, handleToggleKeyDown, isExpanded } = useToggleLayersExpanded();
  const { cursorY, height, onMouseDownY } = useResizeHandler({ ...LAYERS_TREE_RESIZE_SETTINGS, maxHeight }, listRef);
  const handleResizeMouseDown = useHandleTreeResizeMouseDown(onMouseDownY);
  const handleDeselectOnEmptyClick = useDeselectOnEmptyClick();

  const renderRow = (index: number): ReactNode => <TreeItem isSelected={selectedIds.includes(nodes[index].id)} node={nodes[index]} />;

  return (
    <div className={styles.Layers}>
      <div
        aria-expanded={isExpanded}
        className={styles.Layers__header}
        onClick={handleToggleClick}
        onKeyDown={handleToggleKeyDown}
        role="button"
        tabIndex={0}
      >
        <LayersHeaderTitle isExpanded={isExpanded} />
      </div>
      {isExpanded && (
        <div className={styles.Layers__treeWrapper} ref={listRef} style={{ height }}>
          <Tree
            count={nodes.length}
            height={height}
            onDeselectAll={handleDeselectOnEmptyClick}
            renderRow={renderRow}
            rowHeight={LAYERS_TREE_ROW_HEIGHT}
          />
          <div className={styles['Layers__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorY }} />
        </div>
      )}
    </div>
  );
};

export default Layers;
