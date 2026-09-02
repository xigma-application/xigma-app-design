import { FC } from 'react';

// components
import ActionsButton from './ActionsButton/ActionsButton';
import MouseModes from './MouseModes/MouseModes';
import VectorEditToolbar from './VectorEditToolbar/VectorEditToolbar';

// styles
import styles from './toolbar.module.scss';

const Toolbar: FC = () => (
  <div className={styles.Toolbar}>
    <MouseModes />
    <ActionsButton />
    <VectorEditToolbar />
  </div>
);

export default Toolbar;
