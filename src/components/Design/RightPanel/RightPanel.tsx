import { FC, useRef } from 'react';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useResizeHandler } from 'hooks';

// others
import { RIGHT_PANEL_RESIZE_SETTINGS } from './constants';

// store
import { selectIsUiHidden, selectIsUiMinimized } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './right-panel.module.scss';

const RightPanel: FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const isUiHidden = useAppSelector(selectIsUiHidden);
  const isUiMinimized = useAppSelector(selectIsUiMinimized);
  const { cursorX, onMouseDownX, width } = useResizeHandler(RIGHT_PANEL_RESIZE_SETTINGS, panelRef);
  const handleResizeMouseDown = useHandleResizeMouseDown(onMouseDownX);

  if (isUiHidden || isUiMinimized) {
    return null;
  }

  return (
    <div className={styles.RightPanel} ref={panelRef} style={{ width }}>
      <div className={styles['RightPanel__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorX }} />
    </div>
  );
};

export default RightPanel;
