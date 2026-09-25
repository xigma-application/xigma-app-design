import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { ScrubbableInput, Tooltip } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';
import { UITools } from 'shared';

// hooks
import { useStarRatio } from './hooks/useStarRatio';

// others
import { RATIO_MAX, RATIO_MIN } from './constants';
import { translationNameSpace } from '../constants';

const RatioField: FC = () => {
  const { t } = useTranslation();
  const { displayValue, onBlur, onScrub, value } = useStarRatio();

  return (
    <Tooltip content={t(`${translationNameSpace}.ratio.label`)}>
      <TextFieldWrapper
        aria-label={t(`${translationNameSpace}.ratio.label`)}
        defaultValue={displayValue}
        e2eValue="ratio"
        onBlur={onBlur}
        stepNumbers={{ max: RATIO_MAX, min: RATIO_MIN }}
        startAdornment={
          <ScrubbableInput max={RATIO_MAX} min={RATIO_MIN} onChange={onScrub} value={value}>
            <UITools.InputAdornment icon="Ratio" />
          </ScrubbableInput>
        }
        type="text"
      />
    </Tooltip>
  );
};

export default RatioField;
