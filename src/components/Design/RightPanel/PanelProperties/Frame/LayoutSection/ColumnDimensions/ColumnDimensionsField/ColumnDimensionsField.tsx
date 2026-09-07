import { FC, FocusEvent } from 'react';
import { noop } from 'lodash';

// @xigma
import { Icon, ScrubbableInput } from '@xigma/components';

// components
import ColumnDimensionsFieldEndAdornment from './ColumnDimensionsFieldEndAdornment';
import { UITools } from 'shared';

// hooks
import { useColumnDimensionsFieldReveal } from './hooks/useColumnDimensionsFieldReveal';

// others
import { DIMENSIONS_MAX, DIMENSIONS_MIN } from '../constants';
import { getMinMaxIcon } from './utils/getMinMaxIcon';

// styles
import styles from './column-dimensions-field.module.scss';

// types
import { SizingMode } from 'types/design/enums';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnDimensionsFieldProps = {
  ariaLabel: string;
  axis: 'height' | 'width';
  canFill?: boolean;
  canHug?: boolean;
  e2eValue: TE2EValue;
  hasMax?: boolean;
  hasMin?: boolean;
  label: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  onSelectSizingMode?: TFunc<[SizingMode]>;
  onToggleMax?: TFunc;
  onToggleMin?: TFunc;
  sizingMode?: SizingMode;
  value: number;
};

export const ColumnDimensionsField: FC<TColumnDimensionsFieldProps> = ({
  ariaLabel,
  axis,
  canFill = false,
  canHug = false,
  e2eValue,
  hasMax = false,
  hasMin = false,
  label,
  onBlur,
  onDragEnd,
  onDragStart,
  onScrub,
  onSelectSizingMode,
  onToggleMax = noop,
  onToggleMin = noop,
  sizingMode,
  value,
}) => {
  const { isRevealed, onMenuOpenChange, onMouseEnter, onMouseLeave } = useColumnDimensionsFieldReveal();
  const minMaxIcon = getMinMaxIcon(axis === 'width', hasMin, hasMax);

  return (
    <UITools.TextField
      aria-label={ariaLabel}
      defaultValue={value}
      e2eValue={e2eValue}
      endAdornment={
        <ColumnDimensionsFieldEndAdornment
          axis={axis}
          canFill={canFill}
          canHug={canHug}
          hasMax={hasMax}
          hasMin={hasMin}
          isRevealed={isRevealed}
          onMenuOpenChange={onMenuOpenChange}
          onSelectSizingMode={onSelectSizingMode}
          onToggleMax={onToggleMax}
          onToggleMin={onToggleMin}
          sizingMode={sizingMode}
          value={value}
        />
      }
      onBlur={onBlur}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      startAdornment={
        <ScrubbableInput
          max={DIMENSIONS_MAX}
          min={DIMENSIONS_MIN}
          onChange={onScrub}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          value={value}
        >
          {minMaxIcon ? (
            <Icon color="neutral2" name={minMaxIcon} size={12} />
          ) : (
            <span className={styles.ColumnDimensionsField__label}>{label}</span>
          )}
        </ScrubbableInput>
      }
      type="number"
    />
  );
};

export default ColumnDimensionsField;
