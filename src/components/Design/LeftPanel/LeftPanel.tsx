import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import MinimizedToolbar from './File/MinimizedToolbar/MinimizedToolbar';
import NavRail from './NavRail/NavRail';
import PanelContent from './PanelContent/PanelContent';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useReportPanelWidth } from 'components/Design/hooks/useReportPanelWidth/useReportPanelWidth';
import { useResizeHandler } from 'hooks';

// others
import { DEFAULT_FILE_NAME_KEY } from './File/constants';
import { LEFT_PANEL_RESIZE_SETTINGS } from './constants';

// store
import { selectIsUiHidden, selectIsUiMinimized } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './left-panel.module.scss';

// types
import { NavItemName } from './NavRail/types';

const LeftPanel: FC = () => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeNavItem, setActiveNavItem] = useState<NavItemName>(NavItemName.file);
  const [fileName, setFileName] = useState(() => t(DEFAULT_FILE_NAME_KEY));
  const isUiHidden = useAppSelector(selectIsUiHidden);
  const isUiMinimized = useAppSelector(selectIsUiMinimized);
  const { cursorX, onMouseDownX, width } = useResizeHandler(LEFT_PANEL_RESIZE_SETTINGS, panelRef);
  const handleResizeMouseDown = useHandleResizeMouseDown(onMouseDownX);
  const { layout } = useCanvasRefsContext();

  useReportPanelWidth(layout.leftPanelWidthRef, width, !isUiHidden && !isUiMinimized);

  if (isUiHidden) {
    return null;
  }

  if (isUiMinimized) {
    return <MinimizedToolbar name={fileName} />;
  }

  return (
    <div className={styles.LeftPanel} ref={panelRef} style={{ width }}>
      <NavRail activeNavItem={activeNavItem} onSelectNavItem={setActiveNavItem} />
      <PanelContent activeNavItem={activeNavItem} name={fileName} onRenameFile={setFileName} />
      <div className={styles['LeftPanel__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorX }} />
    </div>
  );
};

export default LeftPanel;
