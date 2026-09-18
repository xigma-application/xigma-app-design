import cx from 'classnames';
import { FC, PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Tooltip, UITools } from 'shared';

// hooks
import { TFillSelectModifiers } from '../hooks/useFillSection/hooks/useFillSelection/useFillSelection';
import { useBeginFillHandleDrag } from './hooks/useBeginFillHandleDrag';
import { useContrastBackgroundColor } from './hooks/useContrastBackgroundColor';
import { useConvertSolidToGradientPaint } from './hooks/useConvertSolidToGradientPaint';
import { useConvertToImagePaint } from './hooks/useConvertToImagePaint';
import { useConvertToPatternPaint } from './hooks/useConvertToPatternPaint';
import { useConvertToVideoPaint } from './hooks/useConvertToVideoPaint';
import { useDeactivateImageTabOnPickerClose } from './hooks/useDeactivateImageTabOnPickerClose';
import { useHandleSolidPaintChange } from './hooks/useHandleSolidPaintChange';
import { useIsPointerOverGradientHandle } from './hooks/useIsPointerOverGradientHandle';
import { useOpenThisPicker } from './hooks/useOpenThisPicker';
import { useRotateImagePaint } from './hooks/useRotateImagePaint';
import { useSelectFillRow } from './hooks/useSelectFillRow';
import { useSetFillBlendMode } from './hooks/useSetFillBlendMode';
import { useSetImagePaintAdjustment } from './hooks/useSetImagePaintAdjustment';
import { useSetImagePaintScaleMode } from './hooks/useSetImagePaintScaleMode';
import { useSetImagePaintTileScale } from './hooks/useSetImagePaintTileScale';
import { useSyncGradientEditor } from './hooks/useSyncGradientEditor';
import { useSyncImageEditor } from './hooks/useSyncImageEditor/useSyncImageEditor';
import { useSyncPatternSourcePickTarget } from './hooks/useSyncPatternSourcePickTarget';

// store
import { selectImageFillPickerFocus, selectNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// others
import { DEFAULT_GRADIENT_PANEL_STATE } from './constants';
import { DEFAULT_IMAGE_ADJUSTMENTS, IMAGE_FILL_DEFAULT_TILE_SCALE } from 'constant/canvas';
import { translationNameSpace } from '../constants';

// styles
import styles from './fill-row.module.scss';

// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

// utils
import { getContrastUnsupportedReason } from './utils/getContrastUnsupportedReason';
import { getIsResumingImageFocus } from './utils/getIsResumingImageFocus';
import { getFillRowHexDisplayValue } from './utils/getFillRowHexDisplayValue';
import { getFillRowInitialActiveTab } from './utils/getFillRowInitialActiveTab';
import { getInitialImageEditorModeFromPaint } from './utils/getInitialImageEditorModeFromPaint';
import { getInitialImageFillModeFromPaint } from './utils/getInitialImageFillModeFromPaint';
import { getFillRowSwatchHex } from './utils/getFillRowSwatchHex';
import { getInitialPatternFromPaint } from './utils/getInitialPatternFromPaint';
import { getImagePaintAdjustments } from 'utils/design/paint/getImagePaintAdjustments';

export type TFillRowProps = {
  isDragging: boolean;
  isSelected: boolean;
  nodeId: string | undefined;
  onChange: TFunc<[TPaint]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onPickerOpenChange: TFunc<[boolean]>;
  onRemove: TFunc;
  onSelect: TFunc<[TFillSelectModifiers]>;
  onStartDrag: TFunc<[ReactPointerEvent]>;
  onToggleVisible: TFunc;
  openPickerIndex: number | null;
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
  onPickerOpenChange,
  onRemove,
  onSelect,
  onStartDrag,
  onToggleVisible,
  openPickerIndex,
  paint,
  paintIndex,
  registerRow,
}) => {
  const { t } = useTranslation();
  const isVisible = paint.visible !== false;
  const isImage = paint.type === 'image';
  const isVideo = paint.type === 'video';
  const imageFillPickerFocus = useAppSelector(selectImageFillPickerFocus);
  const isResumingImageFocus = getIsResumingImageFocus(isImage || isVideo, imageFillPickerFocus, nodeId, paintIndex);
  const isPickerOpen = paintIndex === openPickerIndex;
  const [isImageTabActive, setIsImageTabActive] = useState(isResumingImageFocus && isImage);
  const [isVideoTabActive, setIsVideoTabActive] = useState(isResumingImageFocus && isVideo);
  const skipInitialImageEditorArmRef = useRef(isResumingImageFocus);
  const [gradientPanelState, setGradientPanelState] = useState(DEFAULT_GRADIENT_PANEL_STATE);
  const handleClick = useSelectFillRow(onSelect);
  const handleOpenThisPicker = useOpenThisPicker(onPickerOpenChange);
  const handlePointerDown = useBeginFillHandleDrag(onSelect, onStartDrag);
  const handleSolidChange = useHandleSolidPaintChange(paint, onChange);
  const handleGradientChange = useConvertSolidToGradientPaint(paint, onChange);
  const handleImageChange = useConvertToImagePaint(paint, onChange);
  const handleVideoChange = useConvertToVideoPaint(paint, onChange);
  const handleImageAdjustmentChange = useSetImagePaintAdjustment(paint, onChange);
  const handleImageRotate = useRotateImagePaint(paint, onChange);
  const handleImageScaleModeChange = useSetImagePaintScaleMode(paint, onChange, nodeId, paintIndex);
  const handleImageTileScaleChange = useSetImagePaintTileScale(paint, onChange);
  const handlePatternChange = useConvertToPatternPaint(paint, onChange);
  const handleBlendModeChange = useSetFillBlendMode(paint, onChange);
  const contrastBackgroundColor = useContrastBackgroundColor(nodeId);
  const contrastNode = useAppSelector(selectNodes)[nodeId ?? ''];
  const isPointerOverGradientHandle = useIsPointerOverGradientHandle();
  const isPattern = paint.type === 'pattern';
  const isGradient = paint.type !== 'solid' && paint.type !== 'image' && paint.type !== 'pattern' && paint.type !== 'video';
  const value = { alpha: paint.opacity, hex: getFillRowSwatchHex(paint) };
  const hexDisplayValue = getFillRowHexDisplayValue(paint, t);
  const mediaTileScale = isImage || isVideo ? (paint.scale ?? IMAGE_FILL_DEFAULT_TILE_SCALE) : IMAGE_FILL_DEFAULT_TILE_SCALE;
  const imageAdjustments = isImage ? getImagePaintAdjustments(paint) : DEFAULT_IMAGE_ADJUSTMENTS;
  const initialMode = getInitialImageEditorModeFromPaint(paint);
  const isMediaTabActive = isImageTabActive || isVideoTabActive;

  useDeactivateImageTabOnPickerClose(isPickerOpen, setIsImageTabActive);
  useDeactivateImageTabOnPickerClose(isPickerOpen, setIsVideoTabActive);
  useSyncGradientEditor(nodeId, paintIndex, isPickerOpen, gradientPanelState.isGradientTabActive, gradientPanelState.selectedStopIndex);
  useSyncImageEditor(nodeId, paintIndex, isPickerOpen, isMediaTabActive, initialMode, skipInitialImageEditorArmRef.current);
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
          blendMode={paint.blendMode ?? BlendMode.normal}
          className={styles.FillRow__color}
          contrastBackgroundColor={contrastBackgroundColor}
          contrastUnsupportedReason={getContrastUnsupportedReason(paint, contrastNode)}
          hex={value.hex}
          hexDisplayValue={hexDisplayValue}
          imageAdjustments={imageAdjustments}
          imageTileScale={mediaTileScale}
          imageUrl={isImage ? paint.ref : undefined}
          initialActiveTab={getFillRowInitialActiveTab(paint)}
          initialFillMode={getInitialImageFillModeFromPaint(paint)}
          initialGradient={isGradient ? { end: paint.end, start: paint.start, stops: paint.stops, type: paint.type } : undefined}
          initialOpen={isPickerOpen}
          initialPattern={getInitialPatternFromPaint(paint)}
          isPattern={isPattern}
          isPointerOverGradientHandle={isPointerOverGradientHandle}
          isVisible={isVisible}
          onBlendModeChange={handleBlendModeChange}
          onCommitAlpha={(opacity): void => onChange({ ...paint, opacity })}
          onCommitHex={(hex): void => handleSolidChange({ alpha: value.alpha, hex })}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onGradientChange={handleGradientChange}
          onGradientPanelStateChange={setGradientPanelState}
          onImageAdjustmentChange={handleImageAdjustmentChange}
          onImageChange={handleImageChange}
          onImageRotate={handleImageRotate}
          onImageScaleModeChange={handleImageScaleModeChange}
          onImageTabActiveChange={setIsImageTabActive}
          onImageTileScaleChange={handleImageTileScaleChange}
          onOpenChange={onPickerOpenChange}
          onPatternChange={handlePatternChange}
          onPickerChange={handleSolidChange}
          onToggleVisibility={onToggleVisible}
          onTriggerClick={isPickerOpen ? undefined : handleOpenThisPicker}
          onVideoChange={handleVideoChange}
          onVideoRotate={handleImageRotate}
          onVideoScaleModeChange={handleImageScaleModeChange}
          onVideoTabActiveChange={setIsVideoTabActive}
          onVideoTileScaleChange={handleImageTileScaleChange}
          paintTypeRow
          patternSourceNodeId={isPattern ? paint.sourceNodeId : undefined}
          side="right"
          simple
          toggleVisibilityAriaLabel={t(`${translationNameSpace}.${isVisible ? 'hideAriaLabel' : 'showAriaLabel'}`)}
          toggleVisibilityTooltip={t(`${translationNameSpace}.${isVisible ? 'hideTooltip' : 'showTooltip'}`)}
          triggerAriaLabel={t(`${translationNameSpace}.hexAriaLabel`)}
          videoTileScale={mediaTileScale}
          videoUrl={isVideo ? paint.ref : undefined}
        />
      </span>
      <Tooltip content={t(`${translationNameSpace}.deleteTooltip`)}>
        <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.deleteAriaLabel`)} name="Minus" onClick={onRemove} />
      </Tooltip>
    </div>
  );
};

export default FillRow;
