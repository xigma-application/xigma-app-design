import { FC } from 'react';

// components
import Canvas from 'components/Design/Canvas/Canvas';
import LeftPanel from 'components/Design/LeftPanel/LeftPanel';
import RightPanel from 'components/Design/RightPanel/RightPanel';
import Toolbar from 'components/Design/Toolbar/Toolbar';

// core
import CanvasRefsProvider from './core/CanvasRefsProvider/CanvasRefsProvider';
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { useSyncActivePageFromUrl } from './hooks/useSyncActivePageFromUrl';
import { useTheme } from 'hooks';

// styles
import styles from './app.module.scss';

// utils
import { getQueryParam } from './utils/getQueryParam';

const App: FC = () => {
  const projectId = getQueryParam('project');

  useTheme();
  useSyncActivePageFromUrl();

  return (
    <div className={styles.App} data-project-id={projectId ?? undefined}>
      <CanvasRefsProvider>
        <main className={styles.App__design}>
          <LeftPanel />
          <ClassNamesProvider>
            <Canvas />
          </ClassNamesProvider>
          <RightPanel />
          <Toolbar />
        </main>
      </CanvasRefsProvider>
    </div>
  );
};

export default App;
