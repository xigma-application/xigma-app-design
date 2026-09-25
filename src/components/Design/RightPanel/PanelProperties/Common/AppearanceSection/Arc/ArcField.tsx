import { FC } from 'react';

// @xigma
import { ScrubbableInput, Tooltip } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';
import { UITools } from 'shared';

// types
import { TArcField } from './types';

export type TArcFieldProps = { ariaLabel: string; field: TArcField; withIcon?: boolean };

const ArcField: FC<TArcFieldProps> = ({ ariaLabel, field, withIcon = false }) => (
  <Tooltip content={ariaLabel}>
    <TextFieldWrapper
      aria-label={ariaLabel}
      defaultValue={field.displayValue}
      e2eValue={`arc-${field.key}`}
      onBlur={field.onBlur}
      stepNumbers={{ max: field.max, min: field.min }}
      startAdornment={
        withIcon ? (
          <ScrubbableInput max={field.max} min={field.min} onChange={field.onScrub} value={field.value}>
            <UITools.InputAdornment icon="Arc" />
          </ScrubbableInput>
        ) : (
          <UITools.ScrubbableEdge max={field.max} min={field.min} onChange={field.onScrub} value={field.value} />
        )
      }
      type="text"
    />
  </Tooltip>
);

export default ArcField;
