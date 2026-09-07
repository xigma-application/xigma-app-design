import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from './constants';

// types
import { SizingMode } from 'types/design/enums';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export type TColumnDimensionsSizingMenuProps = {
  axis: 'height' | 'width';
  canFill: boolean;
  canHug: boolean;
  mode: SizingMode;
  onSelect: TFunc<[SizingMode]>;
  value: number;
};

export const ColumnDimensionsSizingMenu: FC<TColumnDimensionsSizingMenuProps> = ({ axis, canFill, canHug, mode, onSelect, value }) => {
  const { t } = useTranslation();
  const isWidth = axis === 'width';

  return (
    <>
      <PopoverItem
        icon={isWidth ? 'FixedWidth' : 'FixedHeight'}
        label={t(`${translationNameSpace}.${isWidth ? 'fixedWidth' : 'fixedHeight'}`, { value: Math.round(value) })}
        onClick={() => onSelect(SizingMode.fixed)}
        selected={mode === SizingMode.fixed}
      />
      {canHug && (
        <PopoverItem
          icon={isWidth ? 'AutoWidth' : 'AutoHeight'}
          label={t(`${translationNameSpace}.hug`)}
          onClick={() => onSelect(SizingMode.hug)}
          selected={mode === SizingMode.hug}
        />
      )}
      {canFill && (
        <PopoverItem
          icon={isWidth ? 'WidthRestricted' : 'HeightRestricted'}
          label={t(`${translationNameSpace}.${isWidth ? 'fillWidth' : 'fillHeight'}`)}
          onClick={() => onSelect(SizingMode.fill)}
          selected={mode === SizingMode.fill}
        />
      )}
      <PopoverSeparator />
      <PopoverItem
        icon={isWidth ? 'MinWidth' : 'MinHeight'}
        label={t(`${translationNameSpace}.${isWidth ? 'addMinWidth' : 'addMinHeight'}`)}
      />
      <PopoverItem
        icon={isWidth ? 'MaxWidth' : 'MaxHeight'}
        label={t(`${translationNameSpace}.${isWidth ? 'addMaxWidth' : 'addMaxHeight'}`)}
      />
      <PopoverSeparator />
      <PopoverItem icon="Variables" label={t(`${translationNameSpace}.applyVariable`)} />
    </>
  );
};

export default ColumnDimensionsSizingMenu;
