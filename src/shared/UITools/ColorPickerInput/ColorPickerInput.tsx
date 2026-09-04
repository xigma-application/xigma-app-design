import cx from 'classnames';
import { FC, ReactNode } from 'react';

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
import { TColorPickerValue } from '../ColorPicker/types';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColorPickerInputProps = {
  alpha: number;
  className?: string;
  e2eValue?: TE2EValue;
  hex: string;
  isVisible?: boolean;
  onCommitAlpha: TFunc<[number]>;
  onCommitHex: TFunc<[string]>;
  onPickerChange: TFunc<[TColorPickerValue]>;
  onToggleVisibility?: TFunc;
  toggleVisibilityAriaLabel?: string;
  toggleVisibilityTooltip?: ReactNode;
  triggerAriaLabel?: string;
};

export const ColorPickerInput: FC<TColorPickerInputProps> = ({
  alpha,
  className = '',
  e2eValue = '',
  hex,
  isVisible = true,
  onCommitAlpha,
  onCommitHex,
  onPickerChange,
  onToggleVisibility,
  toggleVisibilityAriaLabel,
  toggleVisibilityTooltip,
  triggerAriaLabel,
}) => {
  const onBlurHex = useHexCommit(hex, onCommitHex);
  const onBlurAlpha = useAlphaCommit(alpha, onCommitAlpha);
  const rounded = Math.round(alpha);

  return (
    <div className={cx(styles.ColorPickerInput, className)}>
      <FieldGroup className={styles.ColorPickerInput__fields}>
        <TextFieldWrapper
          defaultValue={hex.replace('#', '')}
          e2eValue={`${e2eValue}-color`}
          maxLength={6}
          onBlur={onBlurHex}
          startAdornment={
            <ColorPicker
              align="end"
              moveable
              onChange={onPickerChange}
              side="top"
              trigger={<Color alpha={alpha} color={hex} cursor="default" />}
              triggerAriaLabel={triggerAriaLabel}
              triggerClassName={styles.ColorPickerInput__trigger}
              value={{ alpha, hex }}
            />
          }
        />
        <TextFieldWrapper
          className={styles.ColorPickerInput__alpha}
          defaultValue={rounded}
          e2eValue={`${e2eValue}-alpha`}
          endAdornment={
            <ScrubbableInput max={100} min={0} onChange={onCommitAlpha} value={rounded}>
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
