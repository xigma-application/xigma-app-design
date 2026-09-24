import { FC, FocusEvent, useEffect, useRef } from 'react';

// @xigma
import { ScrubbableInput, TIconProps } from '@xigma/components';

// components
import { UITools } from 'shared';

// hooks
import { useDimensionFieldHover } from '../../../Common/ColumnDimensions/hooks/useDimensionFieldHover';

// others
import { DIMENSIONS_MAX } from '../../../Common/ColumnDimensions/constants';

// types
import { TDimensionHintField } from 'store/design/types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnMinMaxDimensionsFieldProps = {
  ariaLabel: string;
  disabled?: boolean;
  displayValue?: number | string;
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
  disabled = false,
  displayValue,
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
      defaultValue={displayValue ?? value}
      disabled={disabled}
      e2eValue={e2eValue}
      inputRef={inputRef}
      onBlur={onBlur}
      stepNumbers={{ max: DIMENSIONS_MAX, min: 0 }}
      onMouseEnter={hintHover.onMouseEnter}
      onMouseLeave={hintHover.onMouseLeave}
      startAdornment={
        <ScrubbableInput
          disabled={disabled}
          max={DIMENSIONS_MAX}
          min={0}
          onChange={onScrub}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          value={value ?? 0}
        >
          <UITools.InputAdornment icon={icon} />
        </ScrubbableInput>
      }
      type={typeof (displayValue ?? value) === 'string' ? 'text' : 'number'}
    />
  );
};

export default ColumnMinMaxDimensionsField;
