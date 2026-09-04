import cx from 'classnames';
import { FC, InputHTMLAttributes, KeyboardEvent, MouseEvent, ReactNode, RefObject } from 'react';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';

// styles
import styles from './text-field-wrapper.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';
import { TextFieldVariant } from '../enums';

export type TTextFieldWrapperProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'color'> & {
  e2eValue?: TE2EValue;
  endAdornment?: ReactNode;
  inputRef?: RefObject<HTMLInputElement | null>;
  startAdornment?: ReactNode;
  variant?: TextFieldVariant;
};

export const TextFieldWrapper: FC<TTextFieldWrapperProps> = ({
  disabled = false,
  e2eValue = '',
  endAdornment,
  inputRef,
  onClick,
  onKeyDown,
  startAdornment,
  variant = TextFieldVariant.filled,
  ...restProps
}) => {
  const handleClick = (event: MouseEvent<HTMLInputElement>): void => {
    event.currentTarget.select();
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }

    onKeyDown?.(event);
  };

  return (
    <div
      className={cx(styles.TextFieldWrapper, styles[`TextFieldWrapper--${variant}`], {
        [styles['TextFieldWrapper--disabled']]: disabled,
      })}
      {...getAttributes(E2EAttribute.textField, e2eValue)}
    >
      {startAdornment}
      <input
        className={styles.TextFieldWrapper__input}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        {...getAttributes(E2EAttribute.textFieldInput, e2eValue)}
        {...getAttributes(E2EAttribute.bypassGlobalShortcuts, 'true')}
        {...restProps}
      />
      {endAdornment}
    </div>
  );
};

export default TextFieldWrapper;
