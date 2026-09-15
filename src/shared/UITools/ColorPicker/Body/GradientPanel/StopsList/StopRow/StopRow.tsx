import cx from 'classnames';
import { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PositionField from './PositionField/PositionField';
import StopColorPanel from './StopColorPanel/StopColorPanel';
import { Icon, Tooltip, UITools } from 'shared';

// others
import { DockedPanelContext } from '../../../../DockedPanelContext';

// styles
import styles from './stop-row.module.scss';

// types
import { TColorPickerValue } from '../../../../types';
import { TEditableGradientStop } from '../../types';

export type TStopRowProps = {
  canRemove: boolean;
  isSelected: boolean;
  onColorChange: TFunc<[TColorPickerValue]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onPositionChange: TFunc<[number]>;
  onRemove: TFunc;
  onSelect: TFunc;
  stop: TEditableGradientStop;
};

export const StopRow: FC<TStopRowProps> = ({
  canRemove,
  isSelected,
  onColorChange,
  onDragEnd,
  onDragStart,
  onPositionChange,
  onRemove,
  onSelect,
  stop,
}) => {
  const { t } = useTranslation();
  const setDockedPanel = useContext(DockedPanelContext);

  const openColorPanel = (): void => {
    setDockedPanel?.(
      <StopColorPanel
        onClose={() => setDockedPanel?.(null)}
        onColorChange={onColorChange}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        value={{ alpha: stop.opacity, hex: stop.color }}
      />,
    );
  };

  return (
    <div className={cx(styles.StopRow, { [styles['StopRow--selected']]: isSelected })} data-no-drag onClick={onSelect}>
      <PositionField onCommit={(percent): void => onPositionChange(percent / 100)} positionPercent={Math.round(stop.position * 100)} />
      <UITools.ColorPickerInput
        alpha={stop.opacity}
        className={styles['StopRow__picker-input']}
        hex={stop.color}
        onCommitAlpha={(opacity): void => onColorChange({ alpha: opacity, hex: stop.color })}
        onCommitHex={(hex): void => onColorChange({ alpha: stop.opacity, hex })}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onPickerChange={onColorChange}
        onTriggerClick={openColorPanel}
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
