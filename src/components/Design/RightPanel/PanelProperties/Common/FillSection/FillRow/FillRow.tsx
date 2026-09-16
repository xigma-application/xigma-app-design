import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { TFillSelectModifiers } from '../hooks/useFillSection/hooks/useFillSelection/useFillSelection';
import { useBeginFillHandleDrag } from './hooks/useBeginFillHandleDrag';
import { useConvertSolidToGradientPaint } from './hooks/useConvertSolidToGradientPaint';
import { useConvertToImagePaint } from './hooks/useConvertToImagePaint';
import { useConvertToPatternPaint } from './hooks/useConvertToPatternPaint';
import { useHandleSolidPaintChange } from './hooks/useHandleSolidPaintChange';
import { useIsPointerOverGradientHandle } from './hooks/useIsPointerOverGradientHandle';
import { useRotateImagePaint } from './hooks/useRotateImagePaint';
import { useSelectFillRow } from './hooks/useSelectFillRow';
import { useSetImagePaintScaleMode } from './hooks/useSetImagePaintScaleMode';
import { useSyncGradientEditor } from './hooks/useSyncGradientEditor';
import { useSyncImageEditor } from './hooks/useSyncImageEditor';
import { useSyncPatternSourcePickTarget } from './hooks/useSyncPatternSourcePickTarget';

// others
import { DEFAULT_GRADIENT_PANEL_STATE } from './constants';
import { translationNameSpace } from '../constants';

// styles
import styles from './fill-row.module.scss';

// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getFillRowHexDisplayValue } from './utils/getFillRowHexDisplayValue';
import { getFillRowInitialActiveTab } from './utils/getFillRowInitialActiveTab';
import { getFillRowSwatchHex } from './utils/getFillRowSwatchHex';
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
  const [isImageTabActive, setIsImageTabActive] = useState(false);
  const [gradientPanelState, setGradientPanelState] = useState(DEFAULT_GRADIENT_PANEL_STATE);
  const handleClick = useSelectFillRow(onSelect);
  const handlePointerDown = useBeginFillHandleDrag(onSelect, onStartDrag);
  const handleSolidChange = useHandleSolidPaintChange(paint, onChange);
  const handleGradientChange = useConvertSolidToGradientPaint(paint, onChange);
  const handleImageChange = useConvertToImagePaint(paint, onChange);
  const handleImageRotate = useRotateImagePaint(paint, onChange);
  const handleImageScaleModeChange = useSetImagePaintScaleMode(paint, onChange, nodeId, paintIndex);
  const handlePatternChange = useConvertToPatternPaint(paint, onChange);
  const isPointerOverGradientHandle = useIsPointerOverGradientHandle();
  const isImage = paint.type === 'image';
  const isPattern = paint.type === 'pattern';
  const isGradient = paint.type !== 'solid' && paint.type !== 'image' && paint.type !== 'pattern';
  const value = { alpha: paint.opacity, hex: getFillRowSwatchHex(paint) };
  const hexDisplayValue = getFillRowHexDisplayValue(paint, t);

  useSyncGradientEditor(nodeId, paintIndex, isPickerOpen, gradientPanelState.isGradientTabActive, gradientPanelState.selectedStopIndex);
  useSyncImageEditor(nodeId, paintIndex, isPickerOpen, isImageTabActive, paint.type === 'image' && Boolean(paint.crop));
  useSyncPatternSourcePickTarget(nodeId, paintIndex, isPickerOpen, isPattern);

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
        <UITools.ColorPickerInput
          align="start"
          alpha={value.alpha}
          className={styles.FillRow__color}
          hex={value.hex}
          hexDisplayValue={hexDisplayValue}
          imageUrl={isImage ? paint.ref : undefined}
          initialActiveTab={getFillRowInitialActiveTab(paint)}
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
          onImageChange={handleImageChange}
          onImageRotate={handleImageRotate}
          onImageScaleModeChange={handleImageScaleModeChange}
          onImageTabActiveChange={setIsImageTabActive}
          onOpenChange={setIsPickerOpen}
          onPatternChange={handlePatternChange}
          onPickerChange={handleSolidChange}
          onToggleVisibility={onToggleVisible}
          paintTypeRow
          patternSourceNodeId={isPattern ? paint.sourceNodeId : undefined}
          side="right"
          simple
          toggleVisibilityAriaLabel={t(`${translationNameSpace}.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
          toggleVisibilityTooltip={t(`${translationNameSpace}.${isVisible ? 'hideTooltip' : 'showTooltip'}`)}
          triggerAriaLabel={t(`${translationNameSpace}.hexAriaLabel`)}
        />
      </span>
      <Tooltip content={t(`${translationNameSpace}.deleteTooltip`)}>
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.deleteAriaLabel`)} name="Minus" onClick={onRemove} />
      </Tooltip>
    </div>
  );
};

export default FillRow;
