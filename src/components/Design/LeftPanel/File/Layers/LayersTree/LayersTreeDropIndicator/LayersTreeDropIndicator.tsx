import { FC } from 'react';

// components
import { TREE_ITEM_INDENT_PX } from 'shared/UI/Tree/constants';

// others
import { LAYERS_TREE_DROP_INDICATOR_ICON_OFFSET_PX, LAYERS_TREE_DROP_INDICATOR_RIGHT_INSET_PX } from './constants';

// styles
import styles from './layers-tree-drop-indicator.module.scss';

export type TLayersTreeDropIndicatorProps = {
  depth?: number;
};

const LayersTreeDropIndicator: FC<TLayersTreeDropIndicatorProps> = ({ depth = 0 }) => {
  const marginLeft = LAYERS_TREE_DROP_INDICATOR_ICON_OFFSET_PX + depth * TREE_ITEM_INDENT_PX;

  return (
    <span
      className={styles.LayersTreeDropIndicator}
      style={{
        marginLeft,
        width: `calc(100% - ${marginLeft + LAYERS_TREE_DROP_INDICATOR_RIGHT_INSET_PX}px)`,
      }}
    />
  );
};

export default LayersTreeDropIndicator;
