import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Tooltip, UITools } from 'shared';

// hooks
import { useConvertSolidToGradientPaint } from '../../FillSection/FillRow/hooks/useConvertSolidToGradientPaint';
import { useHandleSolidPaintChange } from '../../FillSection/FillRow/hooks/useHandleSolidPaintChange';
import { useSetFillBlendMode } from '../../FillSection/FillRow/hooks/useSetFillBlendMode';

// others
import { SELECTION_COLOR_TABS, translationNameSpace } from '../constants';

// styles
import styles from './selection-color-row.module.scss';

// types
import { BlendMode } from 'types/design/enums';
import { TGradientPaint, TPaint, TSolidPaint } from 'types/design/paint/types';
import { TSelectionColorGroup } from '../types';

// utils
import { getFillRowHexDisplayValue } from '../../FillSection/FillRow/utils/getFillRowHexDisplayValue';
import { getFillRowInitialActiveTab } from '../../FillSection/FillRow/utils/getFillRowInitialActiveTab';
import { getFillRowSwatchHex } from '../../FillSection/FillRow/utils/getFillRowSwatchHex';

export type TSelectionColorRowProps = {
  group: TSelectionColorGroup;
  isOpen: boolean;
  onChange: TFunc<[TSolidPaint | TGradientPaint]>;
  onOpenChange: TFunc<[boolean]>;
  onSelectNodes: TFunc;
  selectionCount: number;
};

export const SelectionColorRow: FC<TSelectionColorRowProps> = ({
  group,
  isOpen,
  onChange,
  onOpenChange,
  onSelectNodes,
  selectionCount,
}) => {
  const { t } = useTranslation();
  const { paint } = group;
  const isGradient = paint.type !== 'solid';
  const handleChange = (nextPaint: TPaint): void => onChange(nextPaint as TSolidPaint | TGradientPaint);
  const handleSolidChange = useHandleSolidPaintChange(paint, handleChange);
  const handleGradientChange = useConvertSolidToGradientPaint(paint, handleChange);
  const handleBlendModeChange = useSetFillBlendMode(paint, handleChange);
  const value = { alpha: paint.opacity, hex: getFillRowSwatchHex(paint) };
  const hexDisplayValue = getFillRowHexDisplayValue(paint, t);

  return (
    <div className={styles.SelectionColorRow}>
      <UITools.ColorPickerInput
        align="start"
        alpha={value.alpha}
        availableTabs={SELECTION_COLOR_TABS}
        blendMode={paint.blendMode ?? BlendMode.normal}
        className={styles.SelectionColorRow__color}
        hex={value.hex}
        hexDisplayValue={hexDisplayValue}
        initialActiveTab={getFillRowInitialActiveTab(paint)}
        initialGradient={isGradient ? { end: paint.end, start: paint.start, stops: paint.stops, type: paint.type } : undefined}
        initialOpen={isOpen}
        onBlendModeChange={handleBlendModeChange}
        onCommitAlpha={(opacity): void => onChange({ ...paint, opacity })}
        onCommitHex={(hex): void => handleSolidChange({ alpha: value.alpha, hex })}
        onGradientChange={handleGradientChange}
        onOpenChange={onOpenChange}
        onPickerChange={handleSolidChange}
        onTriggerClick={isOpen ? undefined : (): void => onOpenChange(true)}
        paintTypeRow
        side="right"
        simple
        triggerAriaLabel={t(`${translationNameSpace}.hexAriaLabel`)}
      />
      <Tooltip content={t(`${translationNameSpace}.stylesTooltip`)}>
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.stylesAriaLabel`)}
          className={styles.SelectionColorRow__actionIcon}
          name="StylesAndVariables"
        />
      </Tooltip>
      <Tooltip content={t(`${translationNameSpace}.selectTooltip`, { count: selectionCount })}>
        <UITools.ButtonIcon
          ariaLabel={t(`${translationNameSpace}.selectAriaLabel`, { count: selectionCount })}
          className={styles.SelectionColorRow__actionIcon}
          name="Shield"
          onClick={onSelectNodes}
        />
      </Tooltip>
    </div>
  );
};

export default SelectionColorRow;
