import cx from 'classnames';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

// hooks
import { useEditableInput } from './hooks/useEditableInput';

// styles
import styles from './editable-input.module.scss';

export type TEditableInputProps = {
  action?: ReactNode;
  ariaLabel?: string;
  className?: string;
  onChange: TFunc<[string]>;
  placeholder?: string;
  value: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'onChange' | 'value'>;

export const EditableInput = forwardRef<HTMLInputElement, TEditableInputProps>(
  ({ action, ariaLabel, className = '', onChange, placeholder, value, ...rest }, ref) => {
    const { draft, handleBlur, handleChange, handleKeyDown } = useEditableInput(value, onChange);

    return (
      <div className={cx(styles.EditableInput, className)}>
        <input
          {...rest}
          aria-label={ariaLabel}
          className={styles.EditableInput__field}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={ref}
          type="text"
          value={draft}
        />
        {action && <div className={styles.EditableInput__action}>{action}</div>}
      </div>
    );
  },
);

EditableInput.displayName = 'EditableInput';

export default EditableInput;
