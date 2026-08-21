import { FC } from 'react';

// components
import MouseModes from './MouseModes/MouseModes';
import VectorEditToolbar from './VectorEditToolbar/VectorEditToolbar';

// styles
import styles from './toolbar.module.scss';

const Toolbar: FC = () => (
  <div className={styles.Toolbar}>
    <MouseModes />
    <VectorEditToolbar />
  </div>
);

export default Toolbar;
