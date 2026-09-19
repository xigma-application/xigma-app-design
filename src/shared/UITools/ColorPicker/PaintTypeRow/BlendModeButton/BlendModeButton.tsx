import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import BlendModeMenu from './BlendModeMenu/BlendModeMenu';
import { UITools } from 'shared';

// hooks
import { useBlendModeButton } from './hooks/useBlendModeButton';

// others
import { translationNameSpace } from './constants';

// types
import { BlendMode } from 'types/design/enums';

export type TBlendModeButtonProps = { ariaLabel?: string; onChange?: TFunc<[BlendMode]>; value: BlendMode };

export const BlendModeButton: FC<TBlendModeButtonProps> = ({ ariaLabel, onChange, value }) => {
  const { t } = useTranslation();
  const { icon, onOpenChange, open, selectBlendMode } = useBlendModeButton(value, onChange);
  const label = ariaLabel ?? t(`${translationNameSpace}.ariaLabel`);

  return (
    <UITools.Popover
      asChild
      onOpenChange={onOpenChange}
      open={open}
      trigger={<UITools.ButtonIcon ariaLabel={label} name={icon} selected={open} />}
      triggerTooltip={label}
    >
      <BlendModeMenu onSelect={selectBlendMode} value={value} />
    </UITools.Popover>
  );
};

export default BlendModeButton;
