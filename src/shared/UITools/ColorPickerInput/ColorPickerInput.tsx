import cx from 'classnames';
import { FC, ReactNode, useRef } from 'react';

// @xigma
import { Icon, ScrubbableInput, Tooltip } from '@xigma/components';

// components
import Color from '../Color/Color';
import ColorPicker from '../ColorPicker/ColorPicker';
import FieldGroup from '../FieldGroup/FieldGroup';
import TextFieldWrapper from '../TextField/TextFieldWrapper/TextFieldWrapper';

// hooks
import { useAlphaCommit } from './hooks/useAlphaCommit';
import { useHexCommit } from './hooks/useHexCommit';

// styles
import styles from './color-picker-input.module.scss';

// types
import { ColorPickerTab } from '../ColorPicker/enums';
import { TColorPickerProps, TColorPickerValue, TGradientPanelState } from '../ColorPicker/types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';
import { TGradientPanelChange, TInitialGradient } from '../ColorPicker/Body/GradientPanel/types';

export type TColorPickerInputProps = {
  align?: TColorPickerProps['align'];
  alpha: number;
  className?: string;
  e2eValue?: TE2EValue;
  hex: string;
  hexDisplayValue?: string;
  historyRevision?: number;
  initialActiveTab?: ColorPickerTab;
  initialGradient?: TInitialGradient;
  isPointerOverGradientHandle?: TFunc<[], boolean>;
  isVisible?: boolean;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onGradientChange?: TFunc<[TGradientPanelChange]>;
  onGradientPanelStateChange?: TFunc<[TGradientPanelState]>;
  onOpenChange?: TFunc<[boolean]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onToggleVisibility?: TFunc;
  onTriggerClick?: TFunc;
  paintTypeRow?: boolean;
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
  historyRevision,
  initialActiveTab,
  initialGradient,
  isPointerOverGradientHandle,
  isVisible = true,
  onCommitAlpha,
  onCommitHex,
  onDragEnd,
  onDragStart,
  onGradientChange,
  onGradientPanelStateChange,
  onOpenChange,
  onPickerChange,
  onToggleVisibility,
  onTriggerClick,
  paintTypeRow = false,
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
                <Color alpha={alpha} color={hex} cursor="default" />
              </button>
            ) : (
              <ColorPicker
                align={align}
                historyRevision={historyRevision}
                initialActiveTab={initialActiveTab}
                initialGradient={initialGradient}
                isPointerOverGradientHandle={isPointerOverGradientHandle}
                moveable
                onChange={onPickerChange}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
                onGradientChange={onGradientChange}
                onGradientPanelStateChange={onGradientPanelStateChange}
                onOpenChange={onOpenChange}
                paintTypeRow={paintTypeRow}
                side={side}
                simple={simple}
                title={title}
                trigger={<Color alpha={alpha} color={hex} cursor="default" />}
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
          max={100}
          min={0}
          onBlur={onBlurAlpha}
          type="number"
        />
      </FieldGroup>
      {onToggleVisibility && (
        <Tooltip align="end" content={toggleVisibilityTooltip}>
          <button
            aria-label={toggleVisibilityAriaLabel}
            className={styles.ColorPickerInput__toggle}
            onClick={onToggleVisibility}
            type="button"
          >
            <Icon name={isVisible ? 'EyesOpened' : 'EyesClosed'} size={16} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default ColorPickerInput;
