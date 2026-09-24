import { FC, Fragment } from 'react';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { getRemoveBoundsLabelKey } from './utils/getRemoveBoundsLabelKey';
import { translationNameSpace } from './constants';

// types
import { SizingMode } from 'types/design/enums';

const { PopoverItem, PopoverSeparator } = UITools.PopoverCompound;

export type TColumnDimensionsSizingMenuProps = {
  axis: 'height' | 'width';
  canFill: boolean;
  canHug: boolean;
  maxShown: boolean;
  maxValue?: number | string;
  minShown: boolean;
  minValue?: number | string;
  mode: SizingMode;
  onRemoveBounds?: TFunc;
  onRevealMax?: TFunc;
  onRevealMin?: TFunc;
  onSelect: TFunc<[SizingMode]>;
  value: number | string;
};

export const ColumnDimensionsSizingMenu: FC<TColumnDimensionsSizingMenuProps> = ({
  axis,
  canFill,
  canHug,
  maxShown,
  maxValue,
  minShown,
  minValue,
  mode,
  onRemoveBounds = noop,
  onRevealMax = noop,
  onRevealMin = noop,
  onSelect,
  value,
}) => {
  const { t } = useTranslation();
  const isWidth = axis === 'width';
  const minLabel =
    minValue !== undefined
      ? t(`${translationNameSpace}.${isWidth ? 'minWidthValue' : 'minHeightValue'}`, {
          value: typeof minValue === 'number' ? Math.round(minValue) : minValue,
        })
      : t(`${translationNameSpace}.${isWidth ? 'addMinWidth' : 'addMinHeight'}`);
  const maxLabel =
    maxValue !== undefined
      ? t(`${translationNameSpace}.${isWidth ? 'maxWidthValue' : 'maxHeightValue'}`, {
          value: typeof maxValue === 'number' ? Math.round(maxValue) : maxValue,
        })
      : t(`${translationNameSpace}.${isWidth ? 'addMaxWidth' : 'addMaxHeight'}`);

  return (
    <>
      <PopoverItem
        icon={isWidth ? 'FixedWidth' : 'FixedHeight'}
        iconSize={24}
        label={t(`${translationNameSpace}.${isWidth ? 'fixedWidth' : 'fixedHeight'}`, {
          value: typeof value === 'number' ? Math.round(value) : value,
        })}
        onClick={() => onSelect(SizingMode.fixed)}
        selected={mode === SizingMode.fixed}
      />
      {canHug && (
        <PopoverItem
          icon={isWidth ? 'AutoWidth' : 'AutoHeight'}
          iconSize={24}
          label={t(`${translationNameSpace}.hug`)}
          onClick={() => onSelect(SizingMode.hug)}
          selected={mode === SizingMode.hug}
        />
      )}
      {canFill && (
        <PopoverItem
          icon={isWidth ? 'WidthRestricted' : 'HeightRestricted'}
          iconSize={24}
          label={t(`${translationNameSpace}.${isWidth ? 'fillWidth' : 'fillHeight'}`)}
          onClick={() => onSelect(SizingMode.fill)}
          selected={mode === SizingMode.fill}
        />
      )}
      {canHug && (
        <Fragment>
          <PopoverSeparator />
          <PopoverItem icon={isWidth ? 'MinWidth' : 'MinHeight'} iconSize={24} label={minLabel} onClick={onRevealMin} />
          <PopoverItem icon={isWidth ? 'MaxWidth' : 'MaxHeight'} iconSize={24} label={maxLabel} onClick={onRevealMax} />
          {(minShown || maxShown) && (
            <Fragment>
              <PopoverSeparator />
              <PopoverItem
                icon="RemoveFit"
                iconSize={24}
                label={t(`${translationNameSpace}.${getRemoveBoundsLabelKey(isWidth, minShown, maxShown)}`)}
                onClick={onRemoveBounds}
              />
            </Fragment>
          )}
        </Fragment>
      )}
      <PopoverSeparator />
      <PopoverItem icon="Variables" iconSize={24} label={t(`${translationNameSpace}.applyVariable`)} />
    </>
  );
};

export default ColumnDimensionsSizingMenu;
