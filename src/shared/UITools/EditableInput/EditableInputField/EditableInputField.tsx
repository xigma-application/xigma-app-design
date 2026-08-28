import cx from 'classnames';
import { ChangeEvent, ComponentPropsWithoutRef, FocusEvent, forwardRef, KeyboardEvent } from 'react';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from '../editable-input.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

export type TEditableInputFieldProps = {
  ariaLabel?: string;
  className?: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onChange: TFunc<[ChangeEvent<HTMLInputElement>]>;
  onFocus: TFunc<[FocusEvent<HTMLInputElement>]>;
  onKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
  placeholder?: string;
  value: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'onBlur' | 'onChange' | 'onFocus' | 'onKeyDown' | 'value'>;

export const EditableInputField = forwardRef<HTMLInputElement, TEditableInputFieldProps>(
  ({ ariaLabel, className = '', onBlur, onChange, onFocus, onKeyDown, placeholder, value, ...rest }, ref) => (
    <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
      <input
        {...rest}
        aria-label={ariaLabel}
        autoFocus
        className={cx(styles.EditableInput, styles['EditableInput--editing'], className)}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        ref={ref}
        type="text"
        value={value}
      />
    </E2EDataAttribute>
  ),
);

EditableInputField.displayName = 'EditableInputField';

export default EditableInputField;
