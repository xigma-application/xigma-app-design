import { FC } from 'react';

// components
import Canvas from 'components/Design/Canvas/Canvas';
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';
import LeftPanel from 'components/Design/LeftPanel/LeftPanel';
import RightPanel from 'components/Design/RightPanel/RightPanel';
import Toolbar from 'components/Design/Toolbar/Toolbar';

// hooks
import { useToolbarShortcuts } from './hooks/useToolbarShortcuts/useToolbarShortcuts';

// styles
import styles from './design-page.module.scss';

const DesignPage: FC = () => {
  useToolbarShortcuts();

  return (
    <main className={styles.DesignPage}>
      <LeftPanel />
      <ClassNamesProvider>
        <Canvas />
      </ClassNamesProvider>
      <RightPanel />
      <Toolbar />
    </main>
  );
};

export default DesignPage;
