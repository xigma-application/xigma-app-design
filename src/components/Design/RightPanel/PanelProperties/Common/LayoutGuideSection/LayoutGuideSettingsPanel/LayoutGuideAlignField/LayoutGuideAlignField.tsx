import { ReactElement } from 'react';

// components
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
  <UITools.Field
    Component={UITools.Dropdown<TAlign>}
    bypassGlobalShortcuts={false}
    label={label}
    onSelect={onSelect}
    options={options}
    textAlign="left"
    truncate={false}
    value={value}
    variant="outline"
  />
);

export default LayoutGuideAlignField;
