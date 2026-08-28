import { FC, useRef, useState } from 'react';

// components
import NavRail from './NavRail/NavRail';
import PanelContent from './PanelContent/PanelContent';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useResizeHandler } from 'hooks';

// others
import { LEFT_PANEL_RESIZE_SETTINGS } from './constants';

// styles
import styles from './left-panel.module.scss';

// types
import { NavItemName } from './NavRail/types';

const LeftPanel: FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeNavItem, setActiveNavItem] = useState<NavItemName>(NavItemName.file);
  const { cursorX, onMouseDownX, width } = useResizeHandler(LEFT_PANEL_RESIZE_SETTINGS, panelRef);
  const handleResizeMouseDown = useHandleResizeMouseDown(onMouseDownX);

  return (
    <div className={styles.LeftPanel} ref={panelRef} style={{ width }}>
      <NavRail activeNavItem={activeNavItem} onSelectNavItem={setActiveNavItem} />
      <PanelContent activeNavItem={activeNavItem} />
      <div className={styles['LeftPanel__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorX }} />
    </div>
  );
};

export default LeftPanel;
