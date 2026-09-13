import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { TFillSelectModifiers } from '../hooks/useFillSection/hooks/useFillSelection/useFillSelection';
import { useBeginFillHandleDrag } from './hooks/useBeginFillHandleDrag';
import { useConvertSolidToGradientPaint } from './hooks/useConvertSolidToGradientPaint';
import { useHandleSolidPaintChange } from './hooks/useHandleSolidPaintChange';
import { useSelectFillRow } from './hooks/useSelectFillRow';
import { useSyncGradientEditor } from './hooks/useSyncGradientEditor';

// others
import { DEFAULT_GRADIENT_PANEL_STATE } from './constants';

// styles
import styles from './fill-row.module.scss';

// types
import { ColorPickerTab } from 'shared/UITools/ColorPicker/enums';
import { GRADIENT_TYPE_LABEL_KEY } from 'shared/UITools/ColorPicker/Body/GradientPanel/constants';
import { TPaint } from 'types/design/paint/types';

// utils
import { getNonSolidFillSwatchStyle } from './utils/getNonSolidFillSwatchStyle';
import { translationNameSpace } from '../constants';

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
  const isGradient = paint.type !== 'solid' && paint.type !== 'image';
  const hex = isGradient ? (paint.stops[0]?.color ?? '#000000') : paint.type === 'solid' ? paint.color : '#000000';
  const value = { alpha: paint.opacity, hex };
  const hexDisplayValue = isGradient ? t(GRADIENT_TYPE_LABEL_KEY[paint.type]) : undefined;

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
          <div className={styles.FillRow__gradient}>
            <span className={styles.FillRow__gradientSwatch} style={getNonSolidFillSwatchStyle(paint)} />
            <span className={styles.FillRow__gradientLabel}>{t(`${translationNameSpace}.gradientLabel`)}</span>
            <button
              aria-label={t(`${translationNameSpace}.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
              className={styles.FillRow__toggle}
              onClick={onToggleVisible}
              type="button"
            >
              <Icon name={isVisible ? 'EyesOpened' : 'EyesClosed'} size={16} />
            </button>
          </div>
        ) : (
          <UITools.ColorPickerInput
            align="start"
            alpha={value.alpha}
            className={styles.FillRow__color}
            hex={value.hex}
            hexDisplayValue={hexDisplayValue}
            initialActiveTab={isGradient ? ColorPickerTab.gradient : undefined}
            initialGradient={isGradient ? { end: paint.end, start: paint.start, stops: paint.stops } : undefined}
            isVisible={isVisible}
            onCommitAlpha={(opacity): void => onChange({ ...paint, opacity })}
            onCommitHex={(hex): void => handleSolidChange({ alpha: value.alpha, hex })}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onGradientChange={handleGradientChange}
            onGradientPanelStateChange={setGradientPanelState}
            onOpenChange={setIsPickerOpen}
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
