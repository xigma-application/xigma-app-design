import { FC, FocusEvent, useEffect, useRef } from 'react';

// @xigma
import { Icon, ScrubbableInput, TIconProps } from '@xigma/components';

// components
import { UITools } from 'shared';

// hooks
import { useDimensionFieldHover } from '../hooks/useDimensionFieldHover';

// others
import { DIMENSIONS_MAX } from '../ColumnDimensions/constants';

// types
import { TDimensionHintField } from 'store/design/types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnMinMaxDimensionsFieldProps = {
  ariaLabel: string;
  e2eValue: TE2EValue;
  hintField: TDimensionHintField;
  icon: TIconProps['name'];
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  value: number | undefined;
};

export const ColumnMinMaxDimensionsField: FC<TColumnMinMaxDimensionsFieldProps> = ({
  ariaLabel,
  e2eValue,
  hintField,
  icon,
  onBlur,
  onDragEnd,
  onDragStart,
  onScrub,
  value,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hintHover = useDimensionFieldHover(hintField);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <UITools.TextField
      aria-label={ariaLabel}
      defaultValue={value}
      e2eValue={e2eValue}
      inputRef={inputRef}
      onBlur={onBlur}
      onMouseEnter={hintHover.onMouseEnter}
      onMouseLeave={hintHover.onMouseLeave}
      startAdornment={
        <ScrubbableInput max={DIMENSIONS_MAX} min={0} onChange={onScrub} onMouseDown={onDragStart} onMouseUp={onDragEnd} value={value ?? 0}>
          <Icon color="neutral2" name={icon} size={12} />
        </ScrubbableInput>
      }
      type="number"
    />
  );
};

export default ColumnMinMaxDimensionsField;
