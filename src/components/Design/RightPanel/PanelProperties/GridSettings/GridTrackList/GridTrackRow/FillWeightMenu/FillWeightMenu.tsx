import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { FILL_WEIGHT_PRESETS } from '../constants';
import { translationNameSpace } from '../../../constants';

export type TFillWeightMenuProps = {
  onSelect: TFunc<[number]>;
  value: number;
};

export const FillWeightMenu: FC<TFillWeightMenuProps> = ({ onSelect, value }) => {
  const { t } = useTranslation();

  return (
    <UITools.ButtonMenu
      align="end"
      trigger={<Icon name="ChevronDown" size={10} />}
      triggerAriaLabel={t(`${translationNameSpace}.fillWeightAriaLabel`)}
    >
      {FILL_WEIGHT_PRESETS.map((preset) => (
        <UITools.PopoverCompound.PopoverItem
          key={preset}
          label={`${preset}fr`}
          onClick={() => onSelect(preset)}
          selected={preset === value}
        />
      ))}
    </UITools.ButtonMenu>
  );
};

export default FillWeightMenu;
