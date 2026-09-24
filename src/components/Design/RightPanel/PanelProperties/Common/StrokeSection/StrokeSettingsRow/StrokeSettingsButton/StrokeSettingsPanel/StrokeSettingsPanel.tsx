import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsBasicTab from './StrokeSettingsBasicTab/StrokeSettingsBasicTab';
import StrokeSettingsBrushTab from './StrokeSettingsBrushTab/StrokeSettingsBrushTab';
import StrokeSettingsDynamicTab from './StrokeSettingsDynamicTab/StrokeSettingsDynamicTab';
import StrokeSettingsPanelHeader from './StrokeSettingsPanelHeader/StrokeSettingsPanelHeader';
import { UITools } from 'shared';

// hooks
import { useDockedPanelPosition } from './hooks/useDockedPanelPosition';
import { useStrokeSettingsPanel } from './hooks/useStrokeSettingsPanel';

// others
import { StrokeSettingsDockedPanelContext } from './StrokeSettingsDockedPanelContext';

import { getStrokeSettingsTabButtons } from './utils/getStrokeSettingsTabButtons';
import { translationNameSpace } from '../../../constants';

// styles
import styles from './stroke-settings-panel.module.scss';

// types
import { StrokeMode } from 'types/design/enums';

export type TStrokeSettingsPanelProps = {
  onClose: TFunc;
};

export const StrokeSettingsPanel: FC<TStrokeSettingsPanelProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { activeTab, onTabChange } = useStrokeSettingsPanel();
  const [dockedPanel, setDockedPanel] = useState<ReactNode>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dockedRef = useRef<HTMLDivElement>(null);
  const dockedPanelTop = useDockedPanelPosition(dockedPanel, containerRef, dockedRef);
  const tabButtons = getStrokeSettingsTabButtons((tab) => t(`${translationNameSpace}.settings.tabs.${tab}`));

  useEffect(() => {
    setDockedPanel(null);
  }, [activeTab]);

  return (
    <div className={styles.StrokeSettingsPanel} ref={containerRef}>
      <StrokeSettingsPanelHeader onClose={onClose} />
      <div className={styles.StrokeSettingsPanel__body}>
        <UITools.ToggleButtonGroup onChange={onTabChange} toggleButtons={tabButtons} value={activeTab ?? ''} />
        {activeTab === StrokeMode.basic && <StrokeSettingsBasicTab />}
        {activeTab === StrokeMode.dynamic && <StrokeSettingsDynamicTab />}
        {activeTab === StrokeMode.brush && (
          <StrokeSettingsDockedPanelContext.Provider value={setDockedPanel}>
            <StrokeSettingsBrushTab />
          </StrokeSettingsDockedPanelContext.Provider>
        )}
      </div>
      {dockedPanel && (
        <div
          className={styles.StrokeSettingsPanel__docked}
          ref={dockedRef}
          style={dockedPanelTop === null ? undefined : { bottom: 'auto', top: dockedPanelTop }}
        >
          {dockedPanel}
        </div>
      )}
    </div>
  );
};

export default StrokeSettingsPanel;
