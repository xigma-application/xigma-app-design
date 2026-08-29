import { FC } from 'react';

// components
import LayersHeaderTitle from './LayersHeaderTitle/LayersHeaderTitle';
import LayersTree from './LayersTree/LayersTree';

// hooks
import { useToggleLayersExpanded } from './hooks/useToggleLayersExpanded';

// styles
import styles from './layers.module.scss';

const Layers: FC = () => {
  const { handleToggleClick, handleToggleKeyDown, isExpanded } = useToggleLayersExpanded();

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
      {isExpanded && <LayersTree />}
    </div>
  );
};

export default Layers;
