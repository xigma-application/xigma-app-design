// @xigma
import { TIconProps } from '@xigma/components';

// utils
import { TNumericEffectField } from 'utils/design/effects/getEffectFieldValue';

export type TEffectNumberField = TNumericEffectField;

export type TEffectField = {
  adornmentLabel?: string;
  ariaKey?: string;
  icon?: TIconProps['name'];
  isReadOnly?: boolean;
  key: TEffectNumberField;
  labelKey?: string;
  min: number;
  unit?: string;
};
