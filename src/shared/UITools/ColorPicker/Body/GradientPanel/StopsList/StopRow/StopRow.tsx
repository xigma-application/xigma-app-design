import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PositionField from './PositionField/PositionField';
import { Icon, Tooltip, UITools } from 'shared';

// styles
import styles from './stop-row.module.scss';

// types
import { TColorPickerValue } from '../../../../types';
import { TEditableGradientStop } from '../../types';

export type TStopRowProps = {
  canRemove: boolean;
  isSelected: boolean;
  onColorChange: TFunc<[TColorPickerValue]>;
  onPositionChange: TFunc<[number]>;
  onRemove: TFunc;
  onSelect: TFunc;
  stop: TEditableGradientStop;
};

export const StopRow: FC<TStopRowProps> = ({ canRemove, isSelected, onColorChange, onPositionChange, onRemove, onSelect, stop }) => {
  const { t } = useTranslation();

  return (
    <div className={cx(styles.StopRow, { [styles['StopRow--selected']]: isSelected })} data-no-drag onClick={onSelect}>
      <PositionField onCommit={(percent): void => onPositionChange(percent / 100)} positionPercent={Math.round(stop.position * 100)} />
      <UITools.ColorPickerInput
        alpha={stop.opacity}
        hex={stop.color}
        onCommitAlpha={(opacity): void => onColorChange({ alpha: opacity, hex: stop.color })}
        onCommitHex={(hex): void => onColorChange({ alpha: stop.opacity, hex })}
        onPickerChange={onColorChange}
        simple
        triggerAriaLabel={t('colorPicker.gradient.stops.colorAriaLabel')}
      />
      <Tooltip content={t('colorPicker.gradient.stops.removeAriaLabel')}>
        <UITools.Button
          ariaLabel={t('colorPicker.gradient.stops.removeAriaLabel')}
          className={styles.StopRow__remove}
          disabled={!canRemove}
          onClick={onRemove}
          style={{ padding: 0 }}
        >
          <Icon name="Minus" size={24} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default StopRow;
