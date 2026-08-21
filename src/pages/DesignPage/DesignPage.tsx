import { FC } from 'react';

// components
import Canvas from 'components/Design/Canvas/Canvas';
import LeftPanel from 'components/Design/LeftPanel/LeftPanel';
import RightPanel from 'components/Design/RightPanel/RightPanel';
import Toolbar from 'components/Design/Toolbar/Toolbar';

// core
import CanvasRefsProvider from './core/CanvasRefsProvider/CanvasRefsProvider';
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// styles
import styles from './design-page.module.scss';

const DesignPage: FC = () => (
  <CanvasRefsProvider>
    <main className={styles.DesignPage}>
      <LeftPanel />
      <ClassNamesProvider>
        <Canvas />
      </ClassNamesProvider>
      <RightPanel />
      <Toolbar />
    </main>
  </CanvasRefsProvider>
);

export default DesignPage;
