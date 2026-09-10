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
  maxValue?: number;
  minShown: boolean;
  minValue?: number;
  mode: SizingMode;
  onRemoveBounds?: TFunc;
  onRevealMax?: TFunc;
  onRevealMin?: TFunc;
  onSelect: TFunc<[SizingMode]>;
  value: number;
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
      ? t(`${translationNameSpace}.${isWidth ? 'minWidthValue' : 'minHeightValue'}`, { value: Math.round(minValue) })
      : t(`${translationNameSpace}.${isWidth ? 'addMinWidth' : 'addMinHeight'}`);
  const maxLabel =
    maxValue !== undefined
      ? t(`${translationNameSpace}.${isWidth ? 'maxWidthValue' : 'maxHeightValue'}`, { value: Math.round(maxValue) })
      : t(`${translationNameSpace}.${isWidth ? 'addMaxWidth' : 'addMaxHeight'}`);

  return (
    <>
      <PopoverItem
        icon={isWidth ? 'FixedWidth' : 'FixedHeight'}
        iconSize={12}
        label={t(`${translationNameSpace}.${isWidth ? 'fixedWidth' : 'fixedHeight'}`, { value: Math.round(value) })}
        onClick={() => onSelect(SizingMode.fixed)}
        selected={mode === SizingMode.fixed}
      />
      {canHug && (
        <PopoverItem
          icon={isWidth ? 'AutoWidth' : 'AutoHeight'}
          iconSize={12}
          label={t(`${translationNameSpace}.hug`)}
          onClick={() => onSelect(SizingMode.hug)}
          selected={mode === SizingMode.hug}
        />
      )}
      {canFill && (
        <PopoverItem
          icon={isWidth ? 'WidthRestricted' : 'HeightRestricted'}
          iconSize={12}
          label={t(`${translationNameSpace}.${isWidth ? 'fillWidth' : 'fillHeight'}`)}
          onClick={() => onSelect(SizingMode.fill)}
          selected={mode === SizingMode.fill}
        />
      )}
      {canHug && (
        <Fragment>
          <PopoverSeparator />
          <PopoverItem icon={isWidth ? 'MinWidth' : 'MinHeight'} iconSize={12} label={minLabel} onClick={onRevealMin} />
          <PopoverItem icon={isWidth ? 'MaxWidth' : 'MaxHeight'} iconSize={12} label={maxLabel} onClick={onRevealMax} />
          {(minShown || maxShown) && (
            <Fragment>
              <PopoverSeparator />
              <PopoverItem
                icon="RemoveFit"
                label={t(`${translationNameSpace}.${getRemoveBoundsLabelKey(isWidth, minShown, maxShown)}`)}
                onClick={onRemoveBounds}
              />
            </Fragment>
          )}
        </Fragment>
      )}
      <PopoverSeparator />
      <PopoverItem icon="Variables" iconSize={12} label={t(`${translationNameSpace}.applyVariable`)} />
    </>
  );
};

export default ColumnDimensionsSizingMenu;
