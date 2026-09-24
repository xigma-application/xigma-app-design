import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
import { translationNameSpace } from './constants';

// types
import { TAutoSpacing } from './types';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export type TPopoverAutoLayoutSettingsAutoSpacingProps = {
  disabled: boolean;
  onHoverOption: TFunc<[TAutoSpacing | null]>;
  onMouseEnter: TFunc;
  onMouseLeave: TFunc;
  onSelect: TFunc<[TAutoSpacing]>;
  options: TDropdownOption<TAutoSpacing>[];
  value: TAutoSpacing | undefined;
};

export const PopoverAutoLayoutSettingsAutoSpacing: FC<TPopoverAutoLayoutSettingsAutoSpacingProps> = ({
  disabled,
  onHoverOption,
  onMouseEnter,
  onMouseLeave,
  onSelect,
  options,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip content={disabled ? t(`${translationNameSpace}.autoSpacing.disabledTooltip`) : undefined}>
      <span>
        <UITools.Field
          Component={UITools.Dropdown<TAutoSpacing>}
          controlWidth={112}
          dimmed={disabled}
          disabled={disabled}
          label={t(`${translationNameSpace}.autoSpacing.label`)}
          onHoverOption={onHoverOption}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onSelect={onSelect}
          options={options}
          placeholder={MIXED_LABEL}
          value={value}
          variant="outline"
        />
      </span>
    </Tooltip>
  );
};

export default PopoverAutoLayoutSettingsAutoSpacing;
