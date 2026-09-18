import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeSettingsBasicTab from './StrokeSettingsBasicTab/StrokeSettingsBasicTab';
import StrokeSettingsPanelHeader from './StrokeSettingsPanelHeader/StrokeSettingsPanelHeader';
import { UITools } from 'shared';

// hooks
import { useStrokeSettingsPanel } from './hooks/useStrokeSettingsPanel';

// others
import { getStrokeSettingsTabButtons } from './utils/getStrokeSettingsTabButtons';
import { translationNameSpace } from '../../../constants';

// styles
import styles from './stroke-settings-panel.module.scss';

// types
import { StrokeSettingsTab } from './enums';

export type TStrokeSettingsPanelProps = {
  onClose: TFunc;
};

export const StrokeSettingsPanel: FC<TStrokeSettingsPanelProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { activeTab, onTabChange } = useStrokeSettingsPanel();
  const tabButtons = getStrokeSettingsTabButtons((tab) => t(`${translationNameSpace}.settings.tabs.${tab}`));

  return (
    <div className={styles.StrokeSettingsPanel}>
      <StrokeSettingsPanelHeader onClose={onClose} />
      <div className={styles.StrokeSettingsPanel__body}>
        <UITools.ToggleButtonGroup onChange={onTabChange} toggleButtons={tabButtons} value={activeTab} />
        {activeTab === StrokeSettingsTab.basic && <StrokeSettingsBasicTab />}
      </div>
    </div>
  );
};

export default StrokeSettingsPanel;
