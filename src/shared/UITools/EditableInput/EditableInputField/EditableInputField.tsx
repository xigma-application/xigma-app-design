import cx from 'classnames';
import { ChangeEvent, ComponentPropsWithoutRef, FocusEvent, forwardRef, KeyboardEvent } from 'react';

// styles
import styles from '../editable-input.module.scss';

export type TEditableInputFieldProps = {
  ariaLabel?: string;
  className?: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onChange: TFunc<[ChangeEvent<HTMLInputElement>]>;
  onKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
  placeholder?: string;
  value: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'onBlur' | 'onChange' | 'onKeyDown' | 'value'>;

export const EditableInputField = forwardRef<HTMLInputElement, TEditableInputFieldProps>(
  ({ ariaLabel, className = '', onBlur, onChange, onKeyDown, placeholder, value, ...rest }, ref) => (
    <input
      {...rest}
      aria-label={ariaLabel}
      autoFocus
      className={cx(styles.EditableInput, styles['EditableInput--editing'], className)}
      onBlur={onBlur}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      ref={ref}
      type="text"
      value={value}
    />
  ),
);

EditableInputField.displayName = 'EditableInputField';

export default EditableInputField;
