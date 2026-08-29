import { FC } from 'react';

// others
import { LAYERS_TREE_DROP_INDICATOR_ICON_OFFSET_PX, LAYERS_TREE_DROP_INDICATOR_RIGHT_INSET_PX } from './constants';

// styles
import styles from './layers-tree-drop-indicator.module.scss';

const LayersTreeDropIndicator: FC = () => (
  <span
    className={styles.LayersTreeDropIndicator}
    style={{
      marginLeft: LAYERS_TREE_DROP_INDICATOR_ICON_OFFSET_PX,
      width: `calc(100% - ${LAYERS_TREE_DROP_INDICATOR_ICON_OFFSET_PX + LAYERS_TREE_DROP_INDICATOR_RIGHT_INSET_PX}px)`,
    }}
  />
);

export default LayersTreeDropIndicator;
