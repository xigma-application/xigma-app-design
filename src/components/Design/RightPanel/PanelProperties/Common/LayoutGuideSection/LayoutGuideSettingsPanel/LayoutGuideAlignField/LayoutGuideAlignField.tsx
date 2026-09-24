import { ReactElement } from 'react';

// components
import { UITools } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// types
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export type TLayoutGuideAlignFieldProps<TAlign extends string> = {
  label: string;
  onSelect: TFunc<[TAlign]>;
  options: TDropdownOption<TAlign>[];
  value: TAlign | undefined;
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
    placeholder={MIXED_LABEL}
    textAlign="left"
    truncate={false}
    value={value}
    variant="outline"
  />
);

export default LayoutGuideAlignField;
