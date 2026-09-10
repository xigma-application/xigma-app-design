import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon, ScrubbableInput, Tooltip } from '@xigma/components';

// components
import ColumnGapModeMenu from './ColumnGapModeMenu/ColumnGapModeMenu';
import { UITools } from 'shared';

// hooks
import { useGapCommit } from './hooks/useGapCommit';

// others
import { GAP_MAX, GAP_MIN } from './constants';
import { translationNameSpace } from '../constants';

// types
import { GapMode } from 'types/design/enums';

export type TGapFieldProps = {
  isHorizontal: boolean;
  mode: GapMode;
  modeDisabled?: boolean;
  onCommit: TFunc<[number]>;
  onSelectAuto: TFunc;
  onSelectFixed: TFunc;
  value: number;
};

export const GapField: FC<TGapFieldProps> = ({
  isHorizontal,
  mode,
  modeDisabled = false,
  onCommit,
  onSelectAuto,
  onSelectFixed,
  value,
}) => {
  const { t } = useTranslation();
  const isAuto = mode === GapMode.auto;
  const autoLabel = t(`${translationNameSpace}.gapModeToggleLabel`);
  const handleBlur = useGapCommit(isAuto, autoLabel, value, onCommit);

  return (
    <Tooltip content={t(`${translationNameSpace}.gapTooltip.${isHorizontal ? 'horizontal' : 'vertical'}`)}>
      <UITools.TextField
        aria-label={t(`${translationNameSpace}.gapAriaLabel`)}
        defaultValue={isAuto ? autoLabel : value}
        e2eValue="gap"
        endAdornment={
          <UITools.ButtonMenu
            trigger={<Icon name="ChevronDown" size={10} />}
            triggerAriaLabel={t(`${translationNameSpace}.gapModeMenuAriaLabel.${isHorizontal ? 'horizontal' : 'vertical'}`)}
          >
            <ColumnGapModeMenu
              canAuto={!modeDisabled}
              mode={mode}
              onSelectAuto={onSelectAuto}
              onSelectFixed={onSelectFixed}
              value={value}
            />
          </UITools.ButtonMenu>
        }
        onBlur={handleBlur}
        startAdornment={
          <ScrubbableInput max={GAP_MAX} min={GAP_MIN} onChange={onCommit} value={value}>
            <Icon color="neutral2" name={isHorizontal ? 'GapColumns' : 'GapRows'} size={10} />
          </ScrubbableInput>
        }
        type={isAuto ? 'text' : 'number'}
      />
    </Tooltip>
  );
};

export default GapField;
