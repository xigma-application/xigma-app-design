import cx from 'classnames';
import { FC, InputHTMLAttributes, ReactNode, RefObject } from 'react';

// hooks
import { useKeepMountedWhileFocused } from './hooks/useKeepMountedWhileFocused';
import { useSelectInputOnClick } from './hooks/useSelectInputOnClick';
import { useStepNumbersThroughBlur } from './hooks/useStepNumbersThroughBlur';
import { useStopInputKeyPropagation } from './hooks/useStopInputKeyPropagation';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';

// styles
import styles from './text-field-wrapper.module.scss';

// types
import { TStepNumbers } from 'hooks/useStepNumbersOnKeyDown/types';
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';
import { TextFieldVariant } from '../enums';

export type TTextFieldWrapperProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'color'> & {
  bypassGlobalShortcuts?: boolean;
  className?: string;
  e2eValue?: TE2EValue;
  endAdornment?: ReactNode;
  inputRef?: RefObject<HTMLInputElement | null>;
  keepEndAdornmentOnFocus?: boolean;
  keepMountedWhileFocused?: boolean;
  startAdornment?: ReactNode;
  stepNumbers?: TStepNumbers;
  variant?: TextFieldVariant;
};

export const TextFieldWrapper: FC<TTextFieldWrapperProps> = ({
  bypassGlobalShortcuts = true,
  className = '',
  defaultValue,
  disabled = false,
  e2eValue = '',
  endAdornment,
  inputRef,
  keepEndAdornmentOnFocus = false,
  keepMountedWhileFocused = false,
  onBlur,
  onClick,
  onFocus,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  startAdornment,
  stepNumbers,
  variant = TextFieldVariant.filled,
  ...restProps
}) => {
  const handleClick = useSelectInputOnClick(onClick);
  const handleKeyDown = useStopInputKeyPropagation(useStepNumbersThroughBlur(stepNumbers, onBlur, onKeyDown));
  const { handleBlur, handleFocus, inputKey } = useKeepMountedWhileFocused(
    keepMountedWhileFocused || Boolean(stepNumbers),
    defaultValue as string | number,
    onBlur,
    onFocus,
  );

  return (
    <div
      className={cx(
        styles.TextFieldWrapper,
        styles[`TextFieldWrapper--${variant}`],
        { [styles['TextFieldWrapper--disabled']]: disabled },
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...getAttributes(E2EAttribute.textField, e2eValue)}
    >
      {startAdornment}
      <input
        className={styles.TextFieldWrapper__input}
        defaultValue={defaultValue}
        disabled={disabled}
        key={inputKey}
        onBlur={handleBlur}
        onClick={handleClick}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        {...getAttributes(E2EAttribute.textFieldInput, e2eValue)}
        {...(bypassGlobalShortcuts ? getAttributes(E2EAttribute.bypassGlobalShortcuts, 'true') : {})}
        {...restProps}
      />
      <span
        className={cx(styles.TextFieldWrapper__endAdornment, {
          [styles['TextFieldWrapper__endAdornment--keepOnFocus']]: keepEndAdornmentOnFocus,
        })}
      >
        {endAdornment}
      </span>
    </div>
  );
};

export default TextFieldWrapper;
