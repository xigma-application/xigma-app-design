import { FC, FocusEvent } from 'react';

// @xigma
import { ScrubbableInput, Tooltip } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';

// types
import { UITools, type TIconProps } from 'shared';

// others
import { CORNER_RADIUS_MAX, CORNER_RADIUS_MIN } from './constants';

export type TCornerRadiusInputProps = {
  ariaLabel: string;
  disabled?: boolean;
  e2eValue: string;
  iconName: TIconProps['name'];
  onCommit: (raw: string) => void;
  onScrub: (next: number) => void;
  scrubValue: number;
  tooltip: string;
  value: number | string;
};

const CornerRadiusInput: FC<TCornerRadiusInputProps> = ({
  ariaLabel,
  disabled = false,
  e2eValue,
  iconName,
  onCommit,
  onScrub,
  scrubValue,
  tooltip,
  value,
}) => {
  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => onCommit(event.target.value);

  return (
    <Tooltip content={tooltip}>
      <TextFieldWrapper
        aria-label={ariaLabel}
        defaultValue={value}
        disabled={disabled}
        e2eValue={e2eValue}
        onBlur={handleBlur}
        stepNumbers={{ max: CORNER_RADIUS_MAX, min: CORNER_RADIUS_MIN }}
        startAdornment={
          <ScrubbableInput disabled={disabled} max={CORNER_RADIUS_MAX} min={CORNER_RADIUS_MIN} onChange={onScrub} value={scrubValue}>
            <UITools.InputAdornment icon={iconName} />
          </ScrubbableInput>
        }
        type="text"
      />
    </Tooltip>
  );
};

export default CornerRadiusInput;
