import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { ScrubbableInput, Tooltip } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';
import { UITools } from 'shared';

// hooks
import { usePolygonCount } from './hooks/usePolygonCount';

// others
import { COUNT_MAX, COUNT_MIN } from './constants';
import { translationNameSpace } from '../constants';

const CountRow: FC = () => {
  const { t } = useTranslation();
  const { displayValue, onBlur, onScrub, value } = usePolygonCount();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.count.label`)]}>
      <Tooltip content={t(`${translationNameSpace}.count.label`)}>
        <TextFieldWrapper
          aria-label={t(`${translationNameSpace}.count.label`)}
          defaultValue={displayValue}
          e2eValue="count"
          onBlur={onBlur}
          stepNumbers={{ max: COUNT_MAX, min: COUNT_MIN }}
          startAdornment={
            <ScrubbableInput max={COUNT_MAX} min={COUNT_MIN} onChange={onScrub} value={value}>
              <UITools.InputAdornment icon="Count" />
            </ScrubbableInput>
          }
          type="text"
        />
      </Tooltip>
    </UITools.SectionColumn>
  );
};

export default CountRow;
