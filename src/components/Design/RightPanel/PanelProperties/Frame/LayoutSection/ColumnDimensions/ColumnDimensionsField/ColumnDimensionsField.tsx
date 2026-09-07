import { FC, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon, ScrubbableInput } from '@xigma/components';

// components
import ColumnDimensionsSizingMenu from './ColumnDimensionsSizingMenu/ColumnDimensionsSizingMenu';
import { UITools } from 'shared';

// others
import { DIMENSIONS_MAX, DIMENSIONS_MIN } from '../constants';
import { translationNameSpace } from './ColumnDimensionsSizingMenu/constants';

// styles
import styles from './column-dimensions-field.module.scss';

// types
import { SizingMode } from 'types/design/enums';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnDimensionsFieldProps = {
  ariaLabel: string;
  axis: 'height' | 'width';
  e2eValue: TE2EValue;
  label: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  onSelectSizingMode?: TFunc<[SizingMode]>;
  sizingMode?: SizingMode;
  value: number;
};

export const ColumnDimensionsField: FC<TColumnDimensionsFieldProps> = ({
  ariaLabel,
  axis,
  e2eValue,
  label,
  onBlur,
  onDragEnd,
  onDragStart,
  onScrub,
  onSelectSizingMode,
  sizingMode,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <UITools.TextField
      aria-label={ariaLabel}
      defaultValue={value}
      e2eValue={e2eValue}
      endAdornment={
        sizingMode && onSelectSizingMode ? (
          <UITools.ButtonMenu
            trigger={<Icon name="ChevronDown" size={10} />}
            triggerAriaLabel={t(`${translationNameSpace}.${axis === 'width' ? 'ariaLabelWidth' : 'ariaLabelHeight'}`)}
          >
            <ColumnDimensionsSizingMenu axis={axis} mode={sizingMode} onSelect={onSelectSizingMode} value={value} />
          </UITools.ButtonMenu>
        ) : undefined
      }
      onBlur={onBlur}
      startAdornment={
        <ScrubbableInput
          max={DIMENSIONS_MAX}
          min={DIMENSIONS_MIN}
          onChange={onScrub}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          value={value}
        >
          <span className={styles.ColumnDimensionsField__label}>{label}</span>
        </ScrubbableInput>
      }
      type="number"
    />
  );
};

export default ColumnDimensionsField;
