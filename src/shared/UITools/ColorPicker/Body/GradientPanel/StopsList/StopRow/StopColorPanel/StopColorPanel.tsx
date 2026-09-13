import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColorSampler from '../../../../../ColorSampler/ColorSampler';
import SolidPanel from '../../../../SolidPanel/SolidPanel';
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { useColorModel } from '../../../../../hooks/useColorModel';
import { useColorSampler } from '../../../../../hooks/useColorSampler';

// styles
import styles from './stop-color-panel.module.scss';

// types
import { TColorPickerValue } from '../../../../../types';

export type TStopColorPanelProps = { onClose: TFunc; onColorChange: TFunc<[TColorPickerValue]>; value: TColorPickerValue };

export const StopColorPanel: FC<TStopColorPanelProps> = ({ onClose, onColorChange, value }) => {
  const { t } = useTranslation();
  const colorModel = useColorModel(value, onColorChange);
  const colorSampler = useColorSampler(colorModel.setHex);

  return (
    <div className={styles.StopColorPanel}>
      <div className={styles.StopColorPanel__header}>
        <Tooltip content={t('common.close')}>
          <UITools.Button ariaLabel={t('common.close')} onClick={onClose} style={{ padding: 0 }}>
            <Icon name="Close" size={22} />
          </UITools.Button>
        </Tooltip>
      </div>
      <SolidPanel alpha={value.alpha} colorModel={colorModel} onCloseSampler={colorSampler.close} onOpenSampler={colorSampler.open} />
      {colorSampler.isActive && <ColorSampler onClose={colorSampler.close} onPick={colorSampler.pick} />}
    </div>
  );
};

export default StopColorPanel;
