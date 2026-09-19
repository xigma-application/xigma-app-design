import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { EFFECT_ICONS, EFFECT_MENU_SEPARATED_TYPE, EFFECT_MENU_TYPES, translationNameSpace } from '../constants';

// types
import { EffectType } from 'types/design/enums';

// utils
import { isEffectSupported } from 'utils/design/effects/isEffectSupported';

export type TEffectTypeItemsProps = {
  onSelect: TFunc<[EffectType]>;
  selectedType?: EffectType;
  withCheck?: boolean;
};

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

const EffectTypeItems: FC<TEffectTypeItemsProps> = ({ onSelect, selectedType, withCheck = false }) => {
  const { t } = useTranslation();

  const renderItem = (type: EffectType): JSX.Element => (
    <PopoverItem
      disabled={!isEffectSupported(type)}
      icon={EFFECT_ICONS[type]}
      iconSize={24}
      key={type}
      label={t(`${translationNameSpace}.menu.options.${type}`)}
      onClick={(): void => onSelect(type)}
      selected={type === selectedType}
      withCheck={withCheck}
    />
  );

  return (
    <Fragment>
      {EFFECT_MENU_TYPES.map(renderItem)}
      <PopoverSeparator />
      {renderItem(EFFECT_MENU_SEPARATED_TYPE)}
    </Fragment>
  );
};

export default EffectTypeItems;
