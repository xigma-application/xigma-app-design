import { FC } from 'react';

// core
import { Routing } from 'core';

// hooks
import { useTheme } from 'hooks';

// styles
import styles from './app.module.scss';

const App: FC = () => {
  useTheme();

  return (
    <div className={styles.App}>
      <Routing />
    </div>
  );
};

export default App;
