import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { ScrubbableInput, Tooltip } from '@xigma/components';

// components
import RatioField from '../Ratio/RatioField';
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';
import { UITools } from 'shared';

// hooks
import { useShapeCount } from './hooks/useShapeCount';

// others
import { COUNT_ICONS, COUNT_MAX, COUNT_MIN } from './constants';
import { translationNameSpace } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TCountNodeType } from './types';

export type TCountRowProps = { type: TCountNodeType };

const CountRow: FC<TCountRowProps> = ({ type }) => {
  const { t } = useTranslation();
  const { displayValue, onBlur, onScrub, value } = useShapeCount(type);
  const isStar = type === NodeType.star;

  return (
    <UITools.SectionColumn
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={
        isStar
          ? [t(`${translationNameSpace}.count.label`), t(`${translationNameSpace}.ratio.label`)]
          : [t(`${translationNameSpace}.count.label`)]
      }
    >
      <Tooltip content={t(`${translationNameSpace}.count.label`)}>
        <TextFieldWrapper
          aria-label={t(`${translationNameSpace}.count.label`)}
          defaultValue={displayValue}
          e2eValue="count"
          onBlur={onBlur}
          stepNumbers={{ max: COUNT_MAX, min: COUNT_MIN }}
          startAdornment={
            <ScrubbableInput max={COUNT_MAX} min={COUNT_MIN} onChange={onScrub} value={value}>
              <UITools.InputAdornment icon={COUNT_ICONS[type]} />
            </ScrubbableInput>
          }
          type="text"
        />
      </Tooltip>
      {isStar && <RatioField />}
    </UITools.SectionColumn>
  );
};

export default CountRow;
