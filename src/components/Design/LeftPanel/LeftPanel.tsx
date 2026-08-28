import { FC, useState } from 'react';

// components
import NavRail from './NavRail/NavRail';

// styles
import styles from './left-panel.module.scss';

// types
import { NavItemName } from './NavRail/types';

const LeftPanel: FC = () => {
  const [activeNavItem, setActiveNavItem] = useState<NavItemName>(NavItemName.file);

  return (
    <div className={styles.LeftPanel}>
      <NavRail activeNavItem={activeNavItem} onSelectNavItem={setActiveNavItem} />
    </div>
  );
};

export default LeftPanel;
