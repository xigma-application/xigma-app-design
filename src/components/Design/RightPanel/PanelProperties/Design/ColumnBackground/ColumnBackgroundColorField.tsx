import { FC } from 'react';

// components
import ColorPicker from 'shared/UITools/ColorPicker/ColorPicker';
import { Color, TextField } from 'shared';

// hooks
import { useHexCommit } from './hooks/useHexCommit';

// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';

export type TColumnBackgroundColorFieldProps = {
  alpha: number;
  hex: string;
  onCommit: TFunc<[string]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
};

export const ColumnBackgroundColorField: FC<TColumnBackgroundColorFieldProps> = ({ alpha, hex, onCommit, onPickerChange }) => {
  const onBlur = useHexCommit(hex, onCommit);

  return (
    <TextField
      defaultValue={hex.replace('#', '')}
      e2eValue="background-color"
      key={hex}
      maxLength={6}
      onBlur={onBlur}
      startAdornment={
        <ColorPicker
          onChange={onPickerChange}
          trigger={<Color alpha={alpha} color={hex} />}
          triggerAriaLabel="Background color"
          value={{ alpha, hex }}
        />
      }
    />
  );
};

export default ColumnBackgroundColorField;
