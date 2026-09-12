import { FC, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon, ScrubbableInput, Tooltip } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';

// others
import { OPACITY_MAX, OPACITY_MIN } from './constants';
import { translationNameSpace } from '../constants';

export type TOpacityFieldProps = {
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onScrub: (next: number) => void;
  value: number;
};

const OpacityField: FC<TOpacityFieldProps> = ({ onBlur, onScrub, value }) => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t(`${translationNameSpace}.opacity.tooltip`)}>
      <TextFieldWrapper
        aria-label={t(`${translationNameSpace}.opacity.ariaLabel`)}
        defaultValue={`${value}%`}
        e2eValue="opacity"
        onBlur={onBlur}
        startAdornment={
          <ScrubbableInput max={OPACITY_MAX} min={OPACITY_MIN} onChange={onScrub} value={value}>
            <Icon color="neutral2" name="Opacity" size={12} />
          </ScrubbableInput>
        }
        type="text"
      />
    </Tooltip>
  );
};

export default OpacityField;
