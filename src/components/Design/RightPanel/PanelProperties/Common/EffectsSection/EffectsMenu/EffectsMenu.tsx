import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import EffectTypeItems from '../EffectTypeItems/EffectTypeItems';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

// types
import { EffectType } from 'types/design/enums';

export type TEffectsMenuProps = {
  onSelect: TFunc<[EffectType]>;
};

const EffectsMenu: FC<TEffectsMenuProps> = ({ onSelect }) => {
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
      <EffectTypeItems onSelect={onSelect} />
    </UITools.Popover>
  );
};

export default EffectsMenu;
