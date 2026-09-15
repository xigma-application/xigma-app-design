import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColorSampler from '../../../../../ColorSampler/ColorSampler';
import SolidPanel from '../../../../SolidPanel/SolidPanel';
import { Tooltip, UITools } from 'shared';

// hooks
import { useColorModel } from '../../../../../hooks/useColorModel';
import { useColorSampler } from '../../../../../hooks/useColorSampler';

// others
import { DEFAULT_LIBRARY_TAB } from '../../../../../constants';
import { CUSTOM_LIBRARY_TABS } from '../../../../../Header/constants';

// styles
import headerStyles from '../../../../../Header/header.module.scss';
import styles from './stop-color-panel.module.scss';

// types
import { TColorPickerValue } from '../../../../../types';

export type TStopColorPanelProps = {
  onClose: TFunc;
  onColorChange: TFunc<[TColorPickerValue]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  value: TColorPickerValue;
};

const noopSetActiveTab = (): void => undefined;

export const StopColorPanel: FC<TStopColorPanelProps> = ({ onClose, onColorChange, onDragEnd, onDragStart, value }) => {
  const { t } = useTranslation();
  const colorModel = useColorModel(value, onColorChange);
  const colorSampler = useColorSampler(colorModel.setHex);

  return (
    <div className={styles.StopColorPanel}>
      <div className={headerStyles.Header}>
        <UITools.Tabs activeTab={DEFAULT_LIBRARY_TAB} setActiveTab={noopSetActiveTab} tabs={CUSTOM_LIBRARY_TABS} />
        <div className={headerStyles.Header__actions}>
          <Tooltip content={t('common.close')}>
            <UITools.ButtonIcon ariaLabel={t('common.close')} name="Close" onClick={onClose} />
          </Tooltip>
        </div>
      </div>
      <SolidPanel
        alpha={value.alpha}
        colorModel={colorModel}
        onCloseSampler={colorSampler.close}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onOpenSampler={colorSampler.open}
      />
      {colorSampler.isActive && <ColorSampler onClose={colorSampler.close} onPick={colorSampler.pick} />}
    </div>
  );
};

export default StopColorPanel;
