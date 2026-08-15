import { FC } from 'react';

// components
import Canvas from 'components/Design/Canvas/Canvas';
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';
import Toolbar from 'components/Design/Toolbar/Toolbar';

// hooks
import { useToolbarShortcuts } from './hooks/useToolbarShortcuts/useToolbarShortcuts';

// styles
import styles from './design-page.module.scss';

const DesignPage: FC = () => {
  useToolbarShortcuts();

  return (
    <main className={styles.DesignPage}>
      <ClassNamesProvider>
        <Canvas />
      </ClassNamesProvider>
      <Toolbar />
    </main>
  );
};

export default DesignPage;
