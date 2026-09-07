import { FC, FocusEvent } from 'react';

// @xigma
import { Icon, ScrubbableInput, TIconProps } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { DIMENSIONS_MAX } from '../ColumnDimensions/constants';

// types
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnMinMaxDimensionsFieldProps = {
  ariaLabel: string;
  e2eValue: TE2EValue;
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
  icon,
  onBlur,
  onDragEnd,
  onDragStart,
  onScrub,
  value,
}) => (
  <UITools.TextField
    aria-label={ariaLabel}
    defaultValue={value}
    e2eValue={e2eValue}
    onBlur={onBlur}
    startAdornment={
      <ScrubbableInput max={DIMENSIONS_MAX} min={0} onChange={onScrub} onMouseDown={onDragStart} onMouseUp={onDragEnd} value={value ?? 0}>
        <Icon color="neutral2" name={icon} size={12} />
      </ScrubbableInput>
    }
    type="number"
  />
);

export default ColumnMinMaxDimensionsField;
