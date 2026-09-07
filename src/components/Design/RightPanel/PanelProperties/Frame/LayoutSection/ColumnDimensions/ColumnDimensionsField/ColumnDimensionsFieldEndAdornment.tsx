import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import ColumnDimensionsSizingMenu from './ColumnDimensionsSizingMenu/ColumnDimensionsSizingMenu';
import { UITools } from 'shared';

// others
import { translationNameSpace } from './ColumnDimensionsSizingMenu/constants';

// styles
import styles from './column-dimensions-field.module.scss';

// types
import { SizingMode } from 'types/design/enums';

export type TColumnDimensionsFieldEndAdornmentProps = {
  axis: 'height' | 'width';
  canFill: boolean;
  canHug: boolean;
  isRevealed: boolean;
  maxShown: boolean;
  maxValue?: number;
  minShown: boolean;
  minValue?: number;
  onMenuOpenChange: TFunc<[boolean]>;
  onRemoveBounds?: TFunc;
  onRevealMax?: TFunc;
  onRevealMin?: TFunc;
  onSelectSizingMode?: TFunc<[SizingMode]>;
  sizingMode?: SizingMode;
  value: number;
};

export const ColumnDimensionsFieldEndAdornment: FC<TColumnDimensionsFieldEndAdornmentProps> = ({
  axis,
  canFill,
  canHug,
  isRevealed,
  maxShown,
  maxValue,
  minShown,
  minValue,
  onMenuOpenChange,
  onRemoveBounds,
  onRevealMax,
  onRevealMin,
  onSelectSizingMode,
  sizingMode,
  value,
}) => {
  const { t } = useTranslation();

  if (!onSelectSizingMode || !sizingMode) {
    return null;
  }

  if (!isRevealed && (sizingMode === SizingMode.hug || sizingMode === SizingMode.fill)) {
    const label = sizingMode === SizingMode.hug ? 'Hug' : 'Fill';
    return <span className={styles.ColumnDimensionsField__hugLabel}>{label}</span>;
  }

  return (
    <UITools.ButtonMenu
      onOpenChange={onMenuOpenChange}
      trigger={<Icon name="ChevronDown" size={10} />}
      triggerAriaLabel={t(`${translationNameSpace}.${axis === 'width' ? 'ariaLabelWidth' : 'ariaLabelHeight'}`)}
    >
      <ColumnDimensionsSizingMenu
        axis={axis}
        canFill={canFill}
        canHug={canHug}
        maxShown={maxShown}
        maxValue={maxValue}
        minShown={minShown}
        minValue={minValue}
        mode={sizingMode}
        onRemoveBounds={onRemoveBounds}
        onRevealMax={onRevealMax}
        onRevealMin={onRevealMin}
        onSelect={onSelectSizingMode}
        value={value}
      />
    </UITools.ButtonMenu>
  );
};

export default ColumnDimensionsFieldEndAdornment;
