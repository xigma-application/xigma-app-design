import cx from 'classnames';
import { FC, ReactNode, useRef, useState } from 'react';

// @xigma
import { ScrubbableInput, Tooltip } from '@xigma/components';

// components
import ButtonIcon from '../ButtonIcon/ButtonIcon';
import Color from '../Color/Color';
import ColorPicker from '../ColorPicker/ColorPicker';
import FieldGroup from '../FieldGroup/FieldGroup';
import TextFieldWrapper from '../TextField/TextFieldWrapper/TextFieldWrapper';

// hooks
import { useAlphaCommit } from './hooks/useAlphaCommit';
import { useHexCommit } from './hooks/useHexCommit';
import { usePatternThumbnail } from '../ColorPicker/Body/PatternPanel/PatternSourcePreview/hooks/usePatternThumbnail';

// styles
import styles from './color-picker-input.module.scss';

// types
import { BlendMode } from 'types/design/enums';
import { ColorPickerTab } from '../ColorPicker/enums';
import { TColorPickerProps, TColorPickerValue, TGradientPanelState } from '../ColorPicker/types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';
import { TGradientPanelChange, TInitialGradient } from '../ColorPicker/Body/GradientPanel/types';
import { TImageAdjustments } from 'types/design/paint/types';
import { TImageFillMode, TImagePanelChange } from '../ColorPicker/Body/ImagePanel/types';
import { TInitialPattern, TPatternPanelChange } from '../ColorPicker/Body/PatternPanel/types';
import { TVideoPanelChange } from '../ColorPicker/Body/VideoPanel/types';

export type TColorPickerInputProps = {
  align?: TColorPickerProps['align'];
  alpha: number;
  blendMode?: BlendMode;
  className?: string;
  contrastBackgroundColor?: string;
  e2eValue?: TE2EValue;
  hex: string;
  hexDisplayValue?: string;
  imageAdjustments?: TImageAdjustments;
  imageTileScale?: number;
  imageUrl?: string;
  initialActiveTab?: ColorPickerTab;
  initialFillMode?: TImageFillMode;
  initialGradient?: TInitialGradient;
  initialOpen?: boolean;
  initialPattern?: TInitialPattern;
  isPattern?: boolean;
  isPointerOverGradientHandle?: TFunc<[], boolean>;
  isVisible?: boolean;
  onBlendModeChange?: TFunc<[BlendMode]>;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onGradientChange?: TFunc<[TGradientPanelChange]>;
  onGradientPanelStateChange?: TFunc<[TGradientPanelState]>;
  onImageAdjustmentChange?: TFunc<[keyof TImageAdjustments, number]>;
  onImageChange?: TFunc<[TImagePanelChange]>;
  onImageRotate?: TFunc;
  onImageScaleModeChange?: TFunc<[TImageFillMode]>;
  onImageTabActiveChange?: TFunc<[boolean]>;
  onImageTileScaleChange?: TFunc<[number]>;
  onOpenChange?: TFunc<[boolean]>;
  onPatternChange?: TFunc<[TPatternPanelChange]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onToggleVisibility?: TFunc;
  onTriggerClick?: TFunc;
  onVideoChange?: TFunc<[TVideoPanelChange]>;
  onVideoRotate?: TFunc;
  onVideoScaleModeChange?: TFunc<[TImageFillMode]>;
  onVideoTabActiveChange?: TFunc<[boolean]>;
  onVideoTileScaleChange?: TFunc<[number]>;
  paintTypeRow?: boolean;
  patternSourceNodeId?: string | null;
  side?: TColorPickerProps['side'];
  simple?: boolean;
  title?: string;
  toggleVisibilityAriaLabel?: string;
  toggleVisibilityTooltip?: ReactNode;
  triggerAriaLabel?: string;
  videoTileScale?: number;
  videoUrl?: string;
};

export const ColorPickerInput: FC<TColorPickerInputProps> = ({
  align = 'end',
  alpha,
  blendMode,
  className = '',
  contrastBackgroundColor,
  e2eValue = '',
  hex,
  hexDisplayValue,
  imageAdjustments,
  imageTileScale,
  imageUrl,
  initialActiveTab,
  initialFillMode,
  initialGradient,
  initialOpen,
  initialPattern,
  isPattern = false,
  isPointerOverGradientHandle,
  isVisible = true,
  onBlendModeChange,
  onCommitAlpha,
  onCommitHex,
  onDragEnd,
  onDragStart,
  onGradientChange,
  onGradientPanelStateChange,
  onImageAdjustmentChange,
  onImageChange,
  onImageRotate,
  onImageScaleModeChange,
  onImageTabActiveChange,
  onImageTileScaleChange,
  onOpenChange,
  onPatternChange,
  onPickerChange,
  onToggleVisibility,
  onTriggerClick,
  onVideoChange,
  onVideoRotate,
  onVideoScaleModeChange,
  onVideoTabActiveChange,
  onVideoTileScaleChange,
  paintTypeRow = false,
  patternSourceNodeId,
  side = 'top',
  simple = false,
  title,
  toggleVisibilityAriaLabel,
  toggleVisibilityTooltip,
  triggerAriaLabel,
  videoTileScale,
  videoUrl,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const onBlurHex = useHexCommit(hex, onCommitHex);
  const onBlurAlpha = useAlphaCommit(alpha, onCommitAlpha);
  const rounded = Math.round(alpha);
  const [pickedImageUrl, setPickedImageUrl] = useState<string | null>(null);
  const thumbnailUrl = usePatternThumbnail(isPattern ? patternSourceNodeId : null) ?? pickedImageUrl ?? imageUrl ?? videoUrl;

  const handleHexFieldClick = (): void => {
    rootRef.current?.querySelector<HTMLButtonElement>(`.${styles.ColorPickerInput__trigger}`)?.click();
  };

  return (
    <div className={cx(styles.ColorPickerInput, className)} ref={rootRef}>
      <FieldGroup className={styles.ColorPickerInput__fields}>
        <TextFieldWrapper
          defaultValue={hexDisplayValue ?? hex.replace('#', '')}
          e2eValue={`${e2eValue}-color`}
          maxLength={6}
          onBlur={hexDisplayValue ? undefined : onBlurHex}
          onClick={hexDisplayValue ? handleHexFieldClick : undefined}
          readOnly={Boolean(hexDisplayValue)}
          startAdornment={
            onTriggerClick ? (
              <button aria-label={triggerAriaLabel} className={styles.ColorPickerInput__trigger} onClick={onTriggerClick} type="button">
                <Color alpha={alpha} color={hex} cursor="default" dot={isPattern} thumbnailUrl={thumbnailUrl} />
              </button>
            ) : (
              <ColorPicker
                align={align}
                blendMode={blendMode}
                contrastBackgroundColor={contrastBackgroundColor}
                imageAdjustments={imageAdjustments}
                imageTileScale={imageTileScale}
                initialActiveTab={initialActiveTab}
                initialFillMode={initialFillMode}
                initialGradient={initialGradient}
                initialImageUrl={imageUrl}
                initialOpen={initialOpen}
                initialPattern={initialPattern}
                initialVideoUrl={videoUrl}
                isPointerOverGradientHandle={isPointerOverGradientHandle}
                moveable
                onBlendModeChange={onBlendModeChange}
                onChange={onPickerChange}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
                onGradientChange={onGradientChange}
                onGradientPanelStateChange={onGradientPanelStateChange}
                onImageAdjustmentChange={onImageAdjustmentChange}
                onImageChange={onImageChange}
                onImageRotate={onImageRotate}
                onImageScaleModeChange={onImageScaleModeChange}
                onImageTabActiveChange={onImageTabActiveChange}
                onImageTileScaleChange={onImageTileScaleChange}
                onImageUrlChange={setPickedImageUrl}
                onOpenChange={onOpenChange}
                onPatternChange={onPatternChange}
                onVideoChange={onVideoChange}
                onVideoRotate={onVideoRotate}
                onVideoScaleModeChange={onVideoScaleModeChange}
                onVideoTabActiveChange={onVideoTabActiveChange}
                onVideoTileScaleChange={onVideoTileScaleChange}
                paintTypeRow={paintTypeRow}
                patternSourceNodeId={patternSourceNodeId}
                side={side}
                simple={simple}
                title={title}
                trigger={<Color alpha={alpha} color={hex} cursor="default" dot={isPattern} thumbnailUrl={thumbnailUrl} />}
                triggerAriaLabel={triggerAriaLabel}
                triggerClassName={styles.ColorPickerInput__trigger}
                value={{ alpha, hex }}
                videoTileScale={videoTileScale}
              />
            )
          }
        />
        <TextFieldWrapper
          className={styles.ColorPickerInput__alpha}
          defaultValue={rounded}
          e2eValue={`${e2eValue}-alpha`}
          endAdornment={
            <ScrubbableInput max={100} min={0} onChange={onCommitAlpha} onMouseDown={onDragStart} onMouseUp={onDragEnd} value={rounded}>
              <span className={styles.ColorPickerInput__unit}>%</span>
            </ScrubbableInput>
          }
          keepEndAdornmentOnFocus
          max={100}
          min={0}
          onBlur={onBlurAlpha}
          type="number"
        />
      </FieldGroup>
      {onToggleVisibility && (
        <Tooltip align="end" content={toggleVisibilityTooltip}>
          <ButtonIcon ariaLabel={toggleVisibilityAriaLabel} name={isVisible ? 'EyesOpened' : 'EyesClosed'} onClick={onToggleVisibility} />
        </Tooltip>
      )}
    </div>
  );
};

export default ColorPickerInput;
