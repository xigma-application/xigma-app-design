import cx from 'classnames';
import { FC, ReactNode, useRef } from 'react';

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
import { ColorPickerTab } from '../ColorPicker/enums';
import { TColorPickerProps, TColorPickerValue, TGradientPanelState } from '../ColorPicker/types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';
import { TGradientPanelChange, TInitialGradient } from '../ColorPicker/Body/GradientPanel/types';
import { TInitialPattern, TPatternPanelChange } from '../ColorPicker/Body/PatternPanel/types';

export type TColorPickerInputProps = {
  align?: TColorPickerProps['align'];
  alpha: number;
  className?: string;
  e2eValue?: TE2EValue;
  hex: string;
  hexDisplayValue?: string;
  initialActiveTab?: ColorPickerTab;
  initialGradient?: TInitialGradient;
  initialPattern?: TInitialPattern;
  isPattern?: boolean;
  isPointerOverGradientHandle?: TFunc<[], boolean>;
  isVisible?: boolean;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onGradientChange?: TFunc<[TGradientPanelChange]>;
  onGradientPanelStateChange?: TFunc<[TGradientPanelState]>;
  onOpenChange?: TFunc<[boolean]>;
  onPatternChange?: TFunc<[TPatternPanelChange]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onToggleVisibility?: TFunc;
  onTriggerClick?: TFunc;
  paintTypeRow?: boolean;
  patternSourceNodeId?: string | null;
  side?: TColorPickerProps['side'];
  simple?: boolean;
  title?: string;
  toggleVisibilityAriaLabel?: string;
  toggleVisibilityTooltip?: ReactNode;
  triggerAriaLabel?: string;
};

export const ColorPickerInput: FC<TColorPickerInputProps> = ({
  align = 'end',
  alpha,
  className = '',
  e2eValue = '',
  hex,
  hexDisplayValue,
  initialActiveTab,
  initialGradient,
  initialPattern,
  isPattern = false,
  isPointerOverGradientHandle,
  isVisible = true,
  onCommitAlpha,
  onCommitHex,
  onDragEnd,
  onDragStart,
  onGradientChange,
  onGradientPanelStateChange,
  onOpenChange,
  onPatternChange,
  onPickerChange,
  onToggleVisibility,
  onTriggerClick,
  paintTypeRow = false,
  patternSourceNodeId,
  side = 'top',
  simple = false,
  title,
  toggleVisibilityAriaLabel,
  toggleVisibilityTooltip,
  triggerAriaLabel,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const onBlurHex = useHexCommit(hex, onCommitHex);
  const onBlurAlpha = useAlphaCommit(alpha, onCommitAlpha);
  const rounded = Math.round(alpha);
  const thumbnailUrl = usePatternThumbnail(isPattern ? patternSourceNodeId : null);

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
                initialActiveTab={initialActiveTab}
                initialGradient={initialGradient}
                initialPattern={initialPattern}
                isPointerOverGradientHandle={isPointerOverGradientHandle}
                moveable
                onChange={onPickerChange}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
                onGradientChange={onGradientChange}
                onGradientPanelStateChange={onGradientPanelStateChange}
                onOpenChange={onOpenChange}
                onPatternChange={onPatternChange}
                paintTypeRow={paintTypeRow}
                patternSourceNodeId={patternSourceNodeId}
                side={side}
                simple={simple}
                title={title}
                trigger={<Color alpha={alpha} color={hex} cursor="default" dot={isPattern} thumbnailUrl={thumbnailUrl} />}
                triggerAriaLabel={triggerAriaLabel}
                triggerClassName={styles.ColorPickerInput__trigger}
                value={{ alpha, hex }}
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
