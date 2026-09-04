import { FC, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon, ScrubbableInput, Tooltip } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { GAP_MAX, GAP_MIN } from './constants';
import { translationNameSpace } from '../constants';

export type TGapFieldProps = {
  isHorizontal: boolean;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onScrub: TFunc<[number]>;
  value: number;
};

export const GapField: FC<TGapFieldProps> = ({ isHorizontal, onBlur, onScrub, value }) => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t(`${translationNameSpace}.gapTooltip.${isHorizontal ? 'horizontal' : 'vertical'}`)}>
      <UITools.TextField
        aria-label={t(`${translationNameSpace}.gapAriaLabel`)}
        defaultValue={value}
        e2eValue="gap"
        onBlur={onBlur}
        startAdornment={
          <ScrubbableInput max={GAP_MAX} min={GAP_MIN} onChange={onScrub} value={value}>
            <Icon name={isHorizontal ? 'GapColumns' : 'GapRows'} size={10} />
          </ScrubbableInput>
        }
        type="number"
      />
    </Tooltip>
  );
};

export default GapField;
