import { FC, useRef } from 'react';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useReportPanelWidth } from 'components/Design/hooks/useReportPanelWidth/useReportPanelWidth';
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
  const { layout } = useCanvasRefsContext();

  useReportPanelWidth(layout.rightPanelWidthRef, width, !isUiHidden && !isUiMinimized);

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
