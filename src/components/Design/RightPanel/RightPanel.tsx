import { FC, useRef } from 'react';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useResizeHandler } from 'hooks';

// others
import { RIGHT_PANEL_RESIZE_SETTINGS } from './constants';

// styles
import styles from './right-panel.module.scss';

const RightPanel: FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { cursorX, onMouseDownX, width } = useResizeHandler(RIGHT_PANEL_RESIZE_SETTINGS, panelRef);
  const handleResizeMouseDown = useHandleResizeMouseDown(onMouseDownX);

  return (
    <div className={styles.RightPanel} ref={panelRef} style={{ width }}>
      <div className={styles['RightPanel__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorX }} />
    </div>
  );
};

export default RightPanel;
