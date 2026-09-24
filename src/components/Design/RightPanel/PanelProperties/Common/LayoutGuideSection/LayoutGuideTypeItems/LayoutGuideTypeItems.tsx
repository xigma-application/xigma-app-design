import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { LAYOUT_GUIDE_ICONS, LAYOUT_GUIDE_MENU_TYPES, translationNameSpace } from '../constants';

// types
import { LayoutGuideType } from 'types/design/enums';

export type TLayoutGuideTypeItemsProps = {
  onSelect: TFunc<[LayoutGuideType]>;
  selectedType?: LayoutGuideType;
};

const { PopoverItem } = UITools.PopoverCompound;

const LayoutGuideTypeItems: FC<TLayoutGuideTypeItemsProps> = ({ onSelect, selectedType }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      {LAYOUT_GUIDE_MENU_TYPES.map((type) => (
        <PopoverItem
          icon={LAYOUT_GUIDE_ICONS[type]}
          key={type}
          label={t(`${translationNameSpace}.menu.options.${type}`)}
          onClick={(): void => onSelect(type)}
          selected={type === selectedType}
          withCheck
        />
      ))}
    </Fragment>
  );
};

export default LayoutGuideTypeItems;
