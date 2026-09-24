import { FC } from 'react';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import { UITools } from 'shared';

// types
import { TTextFieldProps } from 'shared/UITools/TextField/TextField';

export type TStrokeScatterBrushInputProps = TTextFieldProps & { tooltip: string };

export const StrokeScatterBrushInput: FC<TStrokeScatterBrushInputProps> = ({ tooltip, ...textFieldProps }) => (
  <Tooltip content={tooltip}>
    <UITools.TextField {...textFieldProps} />
  </Tooltip>
);

export default StrokeScatterBrushInput;
