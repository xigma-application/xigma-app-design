import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { EFFECT_MENU_OPTIONS, SHADER_MENU_OPTION, translationNameSpace } from '../constants';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

const EffectsMenu: FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UITools.Popover
      align="end"
      asChild
      onOpenChange={setIsOpen}
      trigger={<UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.addAriaLabel`)} name="Plus" selected={isOpen} />}
      triggerTooltip={t(`${translationNameSpace}.addTooltip`)}
    >
      {EFFECT_MENU_OPTIONS.map(({ icon, type }) => (
        <PopoverItem icon={icon} iconSize={24} key={type} label={t(`${translationNameSpace}.menu.options.${type}`)} />
      ))}
      <PopoverSeparator />
      <PopoverItem
        icon={SHADER_MENU_OPTION.icon}
        iconSize={24}
        label={t(`${translationNameSpace}.menu.options.${SHADER_MENU_OPTION.type}`)}
      />
    </UITools.Popover>
  );
};

export default EffectsMenu;
