import cx from 'classnames';
import { FC, useRef } from 'react';

// components
import Header from './Header/Header';
import MinimizedHeader from './MinimizedHeader/MinimizedHeader';
import PanelProperties from './PanelProperties/PanelProperties';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useIsNoSelection } from './hooks/useIsNoSelection';
import { useReportPanelWidth } from 'components/Design/hooks/useReportPanelWidth/useReportPanelWidth';
import { useResizeHandler } from 'hooks';

// others
import { RIGHT_PANEL_RESIZE_SETTINGS } from './constants';

// store
import { selectAreRulersVisible, selectIsUiHidden, selectIsUiMinimized } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './right-panel.module.scss';

const RightPanel: FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const isUiHidden = useAppSelector(selectIsUiHidden);
  const isUiMinimized = useAppSelector(selectIsUiMinimized);
  const areRulersVisible = useAppSelector(selectAreRulersVisible);
  const isNoSelection = useIsNoSelection();
  const { cursorX, onMouseDownX, width } = useResizeHandler(RIGHT_PANEL_RESIZE_SETTINGS, panelRef);
  const handleResizeMouseDown = useHandleResizeMouseDown(onMouseDownX);
  const { layout } = useCanvasRefsContext();

  useReportPanelWidth(layout.rightPanelWidthRef, width, !isUiHidden && !isUiMinimized);

  if (isUiHidden) {
    return null;
  }

  if (isUiMinimized && isNoSelection) {
    return <MinimizedHeader />;
  }

  return (
    <div
      className={cx(styles.RightPanel, {
        [styles['RightPanel--floating']]: isUiMinimized,
        [styles['RightPanel--withRulers']]: isUiMinimized && areRulersVisible,
      })}
      ref={panelRef}
      style={{ width }}
    >
      <div className={styles['RightPanel__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorX }} />
      <Header />
      <PanelProperties />
    </div>
  );
};

export default RightPanel;
