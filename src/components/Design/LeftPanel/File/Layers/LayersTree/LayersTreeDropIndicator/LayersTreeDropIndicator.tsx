import { FC } from 'react';

// styles
import styles from './layers-tree-drop-indicator.module.scss';

const LayersTreeDropIndicator: FC = () => (
  <div className={styles.LayersTreeDropIndicator}>
    <span className={styles.LayersTreeDropIndicator__dot} />
    <span className={styles.LayersTreeDropIndicator__line} />
  </div>
);

export default LayersTreeDropIndicator;
