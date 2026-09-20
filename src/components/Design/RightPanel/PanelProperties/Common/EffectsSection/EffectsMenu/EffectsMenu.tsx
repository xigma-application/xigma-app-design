import { FC, useRef, useState } from 'react';
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
  const didSelectRef = useRef(false);

  const handleSelect = (type: EffectType): void => {
    didSelectRef.current = true;
    onSelect(type);
  };

  const handleCloseAutoFocus = (event: Event): void => {
    if (didSelectRef.current) {
      didSelectRef.current = false;
      event.preventDefault();
    }
  };

  return (
    <UITools.Popover
      align="end"
      asChild
      onCloseAutoFocus={handleCloseAutoFocus}
      onOpenChange={setIsOpen}
      trigger={<UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.addAriaLabel`)} name="Plus" selected={isOpen} />}
      triggerTooltip={t(`${translationNameSpace}.addTooltip`)}
    >
      <EffectTypeItems onSelect={handleSelect} />
    </UITools.Popover>
  );
};

export default EffectsMenu;
