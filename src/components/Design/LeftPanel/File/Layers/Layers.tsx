import { FC } from 'react';

// components
import LayersCollapseButton from './LayersCollapseButton/LayersCollapseButton';
import LayersHeaderTitle from './LayersHeaderTitle/LayersHeaderTitle';
import LayersTree from './LayersTree/LayersTree';

// hooks
import { useCollapseLayersShortcut } from './hooks/useCollapseLayersShortcut';
import { useLayersExpansion } from './hooks/useLayersExpansion';
import { useLayersHover } from './hooks/useLayersHover';
import { useToggleLayersExpanded } from './hooks/useToggleLayersExpanded';

// styles
import styles from './layers.module.scss';

const Layers: FC = () => {
  const { handleToggleClick, handleToggleKeyDown, isExpanded } = useToggleLayersExpanded();
  const { collapseAll, expandedIds, hasExpanded, onExpandedIdsChange } = useLayersExpansion();
  const { isHovered, onMouseEnter, onMouseLeave } = useLayersHover();

  useCollapseLayersShortcut(isExpanded && hasExpanded && isHovered, collapseAll);

  return (
    <div className={styles.Layers} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div
        aria-expanded={isExpanded}
        className={styles.Layers__header}
        onClick={handleToggleClick}
        onKeyDown={handleToggleKeyDown}
        role="button"
        tabIndex={0}
      >
        <LayersHeaderTitle isExpanded={isExpanded} />
        {isExpanded && hasExpanded && <LayersCollapseButton onCollapseAll={collapseAll} />}
      </div>
      {isExpanded && <LayersTree expandedIds={expandedIds} onExpandedIdsChange={onExpandedIdsChange} />}
    </div>
  );
};

export default Layers;
