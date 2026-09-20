import { FC } from 'react';

// components
import EffectSettingsField from '../EffectSettingsField/EffectSettingsField';
import { UITools } from 'shared';

// styles
import styles from '../effect-settings-panel.module.scss';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';

export type TEffectColorFieldProps = {
  alpha: number;
  e2eValue: string;
  hex: string;
  label?: string;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onPickerChange: TFunc<[TColorPickerValue]>;
  triggerAriaLabel: string;
};

export const EffectColorField: FC<TEffectColorFieldProps> = ({
  alpha,
  e2eValue,
  hex,
  label,
  onCommitAlpha,
  onCommitHex,
  onDragEnd,
  onDragStart,
  onPickerChange,
  triggerAriaLabel,
}) => (
  <EffectSettingsField label={label}>
    <UITools.ColorPickerInput
      align="start"
      alpha={alpha}
      className={styles.EffectSettingsPanel__color}
      e2eValue={e2eValue}
      hex={hex}
      onCommitAlpha={onCommitAlpha}
      onCommitHex={onCommitHex}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onPickerChange={onPickerChange}
      side="left"
      simple
      triggerAriaLabel={triggerAriaLabel}
    />
  </EffectSettingsField>
);

export default EffectColorField;
