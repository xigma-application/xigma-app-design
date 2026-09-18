import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound } from 'shared/UITools/Popover/Popover';

// others
import { translationNameSpace } from '../constants';

// types
import { ContrastCategory, ContrastLevel } from '../enums';

const { PopoverItem, PopoverSeparator } = PopoverCompound;

const CATEGORIES = [ContrastCategory.auto, ContrastCategory.largeText, ContrastCategory.normalText, ContrastCategory.graphics];
const LEVELS = [ContrastLevel.aa, ContrastLevel.aaa];

export type TContrastSettingsMenuProps = {
  canShowAAA: boolean;
  category: ContrastCategory;
  level: ContrastLevel;
  onSelectCategory: TFunc<[ContrastCategory]>;
  onSelectLevel: TFunc<[ContrastLevel]>;
};

export const ContrastSettingsMenu: FC<TContrastSettingsMenuProps> = ({ canShowAAA, category, level, onSelectCategory, onSelectLevel }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      {CATEGORIES.map((item) => (
        <PopoverItem
          key={item}
          label={t(`${translationNameSpace}.category.${item}`)}
          onClick={(): void => onSelectCategory(item)}
          selected={category === item}
        />
      ))}
      <PopoverSeparator />
      {LEVELS.map((item) => (
        <PopoverItem
          disabled={item === ContrastLevel.aaa && !canShowAAA}
          key={item}
          label={t(`${translationNameSpace}.level.${item}`)}
          onClick={(): void => onSelectLevel(item)}
          selected={level === item}
        />
      ))}
    </Fragment>
  );
};

export default ContrastSettingsMenu;
