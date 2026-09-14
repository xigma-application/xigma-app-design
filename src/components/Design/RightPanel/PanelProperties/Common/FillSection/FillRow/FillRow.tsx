import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { FillImagePreview } from './FillImagePreview/FillImagePreview';
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { TFillSelectModifiers } from '../hooks/useFillSection/hooks/useFillSelection/useFillSelection';
import { useBeginFillHandleDrag } from './hooks/useBeginFillHandleDrag';
import { useConvertSolidToGradientPaint } from './hooks/useConvertSolidToGradientPaint';
import { useConvertToPatternPaint } from './hooks/useConvertToPatternPaint';
import { useHandleSolidPaintChange } from './hooks/useHandleSolidPaintChange';
import { useIsPointerOverGradientHandle } from './hooks/useIsPointerOverGradientHandle';
import { useSelectFillRow } from './hooks/useSelectFillRow';
import { useSyncGradientEditor } from './hooks/useSyncGradientEditor';

// others
import { DEFAULT_GRADIENT_PANEL_STATE } from './constants';
import { translationNameSpace } from '../constants';

// styles
import styles from './fill-row.module.scss';

// types
import { ColorPickerTab } from 'shared/UITools/ColorPicker/enums';
import { GRADIENT_TYPE_LABEL_KEY } from 'shared/UITools/ColorPicker/Body/GradientPanel/constants';
import { TPaint } from 'types/design/paint/types';

// utils
import { getInitialPatternFromPaint } from './utils/getInitialPatternFromPaint';

export type TFillRowProps = {
  isDragging: boolean;
  isSelected: boolean;
  nodeId: string | undefined;
  onChange: TFunc<[TPaint]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onRemove: TFunc;
  onSelect: TFunc<[TFillSelectModifiers]>;
  onStartDrag: TFunc<[ReactPointerEvent]>;
  onToggleVisible: TFunc;
  paint: TPaint;
  paintIndex: number;
  registerRow: (element: HTMLElement | null) => void;
};

export const FillRow: FC<TFillRowProps> = ({
  isDragging,
  isSelected,
  nodeId,
  onChange,
  onDragEnd,
  onDragStart,
  onRemove,
  onSelect,
  onStartDrag,
  onToggleVisible,
  paint,
  paintIndex,
  registerRow,
}) => {
  const { t } = useTranslation();
  const isVisible = paint.visible !== false;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [gradientPanelState, setGradientPanelState] = useState(DEFAULT_GRADIENT_PANEL_STATE);
  const handleClick = useSelectFillRow(onSelect);
  const handlePointerDown = useBeginFillHandleDrag(onSelect, onStartDrag);
  const handleSolidChange = useHandleSolidPaintChange(paint, onChange);
  const handleGradientChange = useConvertSolidToGradientPaint(paint, onChange);
  const handlePatternChange = useConvertToPatternPaint(paint, onChange);
  const isPointerOverGradientHandle = useIsPointerOverGradientHandle();
  const isPattern = paint.type === 'pattern';
  const isGradient = paint.type !== 'solid' && paint.type !== 'image' && paint.type !== 'pattern';
  const hex = isGradient ? (paint.stops[0]?.color ?? '#000000') : isPattern ? '#ffffff' : paint.type === 'solid' ? paint.color : '#000000';
  const value = { alpha: paint.opacity, hex };
  const hexDisplayValue = isGradient ? t(GRADIENT_TYPE_LABEL_KEY[paint.type]) : isPattern ? 'Pattern' : undefined;

  useSyncGradientEditor(nodeId, paintIndex, isPickerOpen, gradientPanelState.isGradientTabActive, gradientPanelState.selectedStopIndex);

  return (
    <div
      className={cx(styles.FillRow, {
        [styles['FillRow--selected']]: isSelected || isDragging,
        [styles['FillRow--pickerOpen']]: isPickerOpen,
      })}
      onClick={handleClick}
      ref={registerRow}
    >
      <button
        aria-label={t(`${translationNameSpace}.reorderAriaLabel`)}
        className={cx(styles.FillRow__handle, { [styles['FillRow__handle--dragging']]: isDragging })}
        onPointerDown={handlePointerDown}
        type="button"
      >
        <Icon color="neutral2" name="RowGrabber" size={7} />
      </button>
      <span data-no-select style={{ display: 'contents' }}>
        {paint.type === 'image' ? (
          <FillImagePreview isVisible={isVisible} onToggleVisible={onToggleVisible} paint={paint} />
        ) : (
          <UITools.ColorPickerInput
            align="start"
            alpha={value.alpha}
            className={styles.FillRow__color}
            hex={value.hex}
            hexDisplayValue={hexDisplayValue}
            initialActiveTab={isGradient ? ColorPickerTab.gradient : isPattern ? ColorPickerTab.pattern : undefined}
            initialGradient={isGradient ? { end: paint.end, start: paint.start, stops: paint.stops, type: paint.type } : undefined}
            initialPattern={getInitialPatternFromPaint(paint)}
            isPattern={isPattern}
            isPointerOverGradientHandle={isPointerOverGradientHandle}
            isVisible={isVisible}
            onCommitAlpha={(opacity): void => onChange({ ...paint, opacity })}
            onCommitHex={(hex): void => handleSolidChange({ alpha: value.alpha, hex })}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onGradientChange={handleGradientChange}
            onGradientPanelStateChange={setGradientPanelState}
            onOpenChange={setIsPickerOpen}
            onPatternChange={handlePatternChange}
            onPickerChange={handleSolidChange}
            onToggleVisibility={onToggleVisible}
            paintTypeRow
            side="right"
            simple
            toggleVisibilityAriaLabel={t(`${translationNameSpace}.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
            toggleVisibilityTooltip={t(`${translationNameSpace}.${isVisible ? 'hideTooltip' : 'showTooltip'}`)}
            triggerAriaLabel={t(`${translationNameSpace}.hexAriaLabel`)}
          />
        )}
      </span>
      <Tooltip content={t(`${translationNameSpace}.deleteTooltip`)}>
        <UITools.Button ariaLabel={t(`${translationNameSpace}.deleteAriaLabel`)} onClick={onRemove} style={{ padding: 0 }}>
          <Icon name="Minus" size={24} />
        </UITools.Button>
      </Tooltip>
    </div>
  );
};

export default FillRow;
