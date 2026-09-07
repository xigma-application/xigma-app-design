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
  hasMax: boolean;
  hasMin: boolean;
  mode: SizingMode;
  onSelect: TFunc<[SizingMode]>;
  onToggleMax: TFunc;
  onToggleMin: TFunc;
  value: number;
};

export const ColumnDimensionsSizingMenu: FC<TColumnDimensionsSizingMenuProps> = ({
  axis,
  canFill,
  canHug,
  hasMax,
  hasMin,
  mode,
  onSelect,
  onToggleMax,
  onToggleMin,
  value,
}) => {
  const { t } = useTranslation();
  const isWidth = axis === 'width';
  const minLabelKey = hasMin ? (isWidth ? 'removeMinWidth' : 'removeMinHeight') : isWidth ? 'addMinWidth' : 'addMinHeight';
  const maxLabelKey = hasMax ? (isWidth ? 'removeMaxWidth' : 'removeMaxHeight') : isWidth ? 'addMaxWidth' : 'addMaxHeight';

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
      {canHug && (
        <>
          <PopoverSeparator />
          <PopoverItem
            icon={isWidth ? 'MinWidth' : 'MinHeight'}
            label={t(`${translationNameSpace}.${minLabelKey}`)}
            onClick={onToggleMin}
            selected={hasMin}
          />
          <PopoverItem
            icon={isWidth ? 'MaxWidth' : 'MaxHeight'}
            label={t(`${translationNameSpace}.${maxLabelKey}`)}
            onClick={onToggleMax}
            selected={hasMax}
          />
        </>
      )}
      <PopoverSeparator />
      <PopoverItem icon="Variables" label={t(`${translationNameSpace}.applyVariable`)} />
    </>
  );
};

export default ColumnDimensionsSizingMenu;
