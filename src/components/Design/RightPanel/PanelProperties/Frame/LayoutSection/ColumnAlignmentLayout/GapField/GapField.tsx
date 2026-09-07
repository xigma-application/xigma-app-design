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
  isModeAuto: boolean;
  isModeToggleDisabled?: boolean;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onScrub: TFunc<[number]>;
  onToggleMode: TFunc;
  value: number;
};

export const GapField: FC<TGapFieldProps> = ({
  isHorizontal,
  isModeAuto,
  isModeToggleDisabled = false,
  onBlur,
  onScrub,
  onToggleMode,
  value,
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip content={t(`${translationNameSpace}.gapTooltip.${isHorizontal ? 'horizontal' : 'vertical'}`)}>
      <UITools.TextField
        aria-label={t(`${translationNameSpace}.gapAriaLabel`)}
        defaultValue={value}
        disabled={isModeAuto}
        e2eValue="gap"
        endAdornment={
          <Tooltip content={t(`${translationNameSpace}.gapModeToggleTooltip.${isModeAuto ? 'auto' : 'fixed'}`)}>
            <UITools.Button
              active={isModeAuto}
              ariaLabel={t(`${translationNameSpace}.gapModeToggleAriaLabel`)}
              disabled={isModeToggleDisabled}
              onClick={onToggleMode}
            >
              {t(`${translationNameSpace}.gapModeToggleLabel`)}
            </UITools.Button>
          </Tooltip>
        }
        onBlur={onBlur}
        startAdornment={
          <ScrubbableInput disabled={isModeAuto} max={GAP_MAX} min={GAP_MIN} onChange={onScrub} value={value}>
            <Icon name={isHorizontal ? 'GapColumns' : 'GapRows'} size={10} />
          </ScrubbableInput>
        }
        type="number"
      />
    </Tooltip>
  );
};

export default GapField;
