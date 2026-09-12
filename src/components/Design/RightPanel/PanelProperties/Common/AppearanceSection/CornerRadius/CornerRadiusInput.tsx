import { FC, FocusEvent } from 'react';

// @xigma
import { Icon, ScrubbableInput, Tooltip } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';

// types
import type { TIconProps } from 'shared';

// others
import { CORNER_RADIUS_MAX, CORNER_RADIUS_MIN } from './constants';

// styles
import styles from './corner-radius-input.module.scss';

export type TCornerRadiusInputProps = {
  ariaLabel: string;
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
        className={styles.CornerRadiusInput__input}
        defaultValue={value}
        e2eValue={e2eValue}
        onBlur={handleBlur}
        startAdornment={
          <ScrubbableInput max={CORNER_RADIUS_MAX} min={CORNER_RADIUS_MIN} onChange={onScrub} value={scrubValue}>
            <Icon color="neutral2" name={iconName} size={24} />
          </ScrubbableInput>
        }
        type="text"
      />
    </Tooltip>
  );
};

export default CornerRadiusInput;
