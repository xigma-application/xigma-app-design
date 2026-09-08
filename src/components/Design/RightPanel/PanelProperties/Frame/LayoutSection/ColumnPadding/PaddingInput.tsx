import { FC, FocusEvent } from 'react';

// @xigma
import { Icon, ScrubbableInput, Tooltip } from '@xigma/components';

// components
import { UITools, type TIconProps } from 'shared';

// others
import { PADDING_MAX, PADDING_MIN } from './constants';

export type TPaddingInputProps = {
  ariaLabel: string;
  e2eValue: string;
  iconName: TIconProps['name'];
  onCommit: (raw: string) => void;
  onHoverEnd: () => void;
  onHoverStart: () => void;
  onScrub: (next: number) => void;
  scrubValue: number;
  tooltip: string;
  value: number | string;
};

const PaddingInput: FC<TPaddingInputProps> = ({
  ariaLabel,
  e2eValue,
  iconName,
  onCommit,
  onHoverEnd,
  onHoverStart,
  onScrub,
  scrubValue,
  tooltip,
  value,
}) => {
  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    onCommit(event.target.value);
  };

  return (
    <div onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}>
      <Tooltip content={tooltip}>
        <UITools.TextField
          aria-label={ariaLabel}
          defaultValue={value}
          e2eValue={e2eValue}
          onBlur={handleBlur}
          startAdornment={
            <ScrubbableInput max={PADDING_MAX} min={PADDING_MIN} onChange={onScrub} value={scrubValue}>
              <Icon name={iconName} size={24} />
            </ScrubbableInput>
          }
          type="text"
        />
      </Tooltip>
    </div>
  );
};

export default PaddingInput;
