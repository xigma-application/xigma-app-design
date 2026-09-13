import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColorSampler from '../../../../../ColorSampler/ColorSampler';
import SolidPanel from '../../../../SolidPanel/SolidPanel';
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { useColorModel } from '../../../../../hooks/useColorModel';
import { useColorSampler } from '../../../../../hooks/useColorSampler';

// others
import { CUSTOM_LIBRARY_TABS } from '../../../../../Header/constants';

// styles
import headerStyles from '../../../../../Header/header.module.scss';
import styles from './stop-color-panel.module.scss';

// types
import { ColorPickerTab } from '../../../../../enums';
import { TColorPickerValue } from '../../../../../types';

export type TStopColorPanelProps = { onClose: TFunc; onColorChange: TFunc<[TColorPickerValue]>; value: TColorPickerValue };

const noopSetActiveTab = (): void => undefined;

export const StopColorPanel: FC<TStopColorPanelProps> = ({ onClose, onColorChange, value }) => {
  const { t } = useTranslation();
  const colorModel = useColorModel(value, onColorChange);
  const colorSampler = useColorSampler(colorModel.setHex);

  return (
    <div className={styles.StopColorPanel}>
      <div className={headerStyles.Header}>
        <UITools.Tabs activeTab={ColorPickerTab.solid} setActiveTab={noopSetActiveTab} tabs={CUSTOM_LIBRARY_TABS} />
        <div className={headerStyles.Header__actions}>
          <Tooltip content={t('common.close')}>
            <UITools.Button ariaLabel={t('common.close')} onClick={onClose} style={{ padding: 0 }}>
              <Icon name="Close" size={22} />
            </UITools.Button>
          </Tooltip>
        </div>
      </div>
      <SolidPanel alpha={value.alpha} colorModel={colorModel} onCloseSampler={colorSampler.close} onOpenSampler={colorSampler.open} />
      {colorSampler.isActive && <ColorSampler onClose={colorSampler.close} onPick={colorSampler.pick} />}
    </div>
  );
};

export default StopColorPanel;
