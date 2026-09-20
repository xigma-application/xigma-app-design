import { FC, FocusEvent } from 'react';

// components
import EffectSettingsField from '../../../EffectsSection/EffectSettingsPanel/EffectSettingsField/EffectSettingsField';
import { UITools } from 'shared';

// styles
import fieldStyles from '../../../EffectsSection/EffectSettingsPanel/EffectSettingsField/effect-settings-field.module.scss';

export type TLayoutGuideNumberFieldProps = {
  ariaLabel: string;
  disabled?: boolean;
  label: string;
  max?: number;
  min: number;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onScrub: TFunc<[number]>;
  placeholder?: string;
  unit?: string;
  value: number;
};

export const LayoutGuideNumberField: FC<TLayoutGuideNumberFieldProps> = ({
  ariaLabel,
  disabled = false,
  label,
  max = Number.POSITIVE_INFINITY,
  min,
  onBlur,
  onScrub,
  placeholder,
  unit = '',
  value,
}) => (
  <EffectSettingsField label={label}>
    <UITools.TextField
      aria-label={ariaLabel}
      className={fieldStyles.EffectSettingsField__input}
      defaultValue={disabled ? '' : `${value}${unit}`}
      disabled={disabled}
      onBlur={onBlur}
      placeholder={placeholder}
      startAdornment={!disabled && <UITools.ScrubbableEdge max={max} min={min} onChange={onScrub} value={value} />}
      stepNumbers={{ max, min }}
      type="text"
    />
  </EffectSettingsField>
);

export default LayoutGuideNumberField;
