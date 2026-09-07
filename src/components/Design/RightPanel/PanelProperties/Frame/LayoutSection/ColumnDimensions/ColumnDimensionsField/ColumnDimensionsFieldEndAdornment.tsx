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
  onMenuOpenChange: TFunc<[boolean]>;
  onSelectSizingMode?: TFunc<[SizingMode]>;
  sizingMode?: SizingMode;
  value: number;
};

export const ColumnDimensionsFieldEndAdornment: FC<TColumnDimensionsFieldEndAdornmentProps> = ({
  axis,
  canFill,
  canHug,
  isRevealed,
  onMenuOpenChange,
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
        mode={sizingMode}
        onSelect={onSelectSizingMode}
        value={value}
      />
    </UITools.ButtonMenu>
  );
};

export default ColumnDimensionsFieldEndAdornment;
