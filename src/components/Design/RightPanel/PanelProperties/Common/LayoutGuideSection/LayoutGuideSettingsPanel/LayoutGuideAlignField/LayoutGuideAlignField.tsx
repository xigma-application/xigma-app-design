import { ReactElement } from 'react';

// components
import EffectSettingsField from '../../../EffectsSection/EffectSettingsPanel/EffectSettingsField/EffectSettingsField';
import { UITools } from 'shared';

// types
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export type TLayoutGuideAlignFieldProps<TAlign extends string> = {
  label: string;
  onSelect: TFunc<[TAlign]>;
  options: TDropdownOption<TAlign>[];
  value: TAlign;
};

export const LayoutGuideAlignField = <TAlign extends string>({
  label,
  onSelect,
  options,
  value,
}: TLayoutGuideAlignFieldProps<TAlign>): ReactElement => (
  <EffectSettingsField label={label}>
    <UITools.Dropdown<TAlign>
      bypassGlobalShortcuts={false}
      onSelect={onSelect}
      options={options}
      textAlign="left"
      truncate={false}
      value={value}
      variant="outline"
    />
  </EffectSettingsField>
);

export default LayoutGuideAlignField;
