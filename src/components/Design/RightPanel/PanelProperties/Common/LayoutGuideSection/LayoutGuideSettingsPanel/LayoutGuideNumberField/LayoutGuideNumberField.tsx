import { FC, FocusEvent } from 'react';

// components
import { UITools } from 'shared';

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
  <UITools.Field
    Component={UITools.TextField}
    aria-label={ariaLabel}
    defaultValue={disabled ? '' : `${value}${unit}`}
    disabled={disabled}
    label={label}
    onBlur={onBlur}
    placeholder={placeholder}
    startAdornment={!disabled && <UITools.ScrubbableEdge max={max} min={min} onChange={onScrub} value={value} />}
    stepNumbers={{ max, min }}
    type="text"
  />
);

export default LayoutGuideNumberField;
