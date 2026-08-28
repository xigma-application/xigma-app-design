import cx from 'classnames';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';
import { noop } from 'lodash';

// components
import EditableInputDisplay from './EditableInputDisplay/EditableInputDisplay';
import EditableInputField from './EditableInputField/EditableInputField';
import EditableInputGroup from './EditableInputGroup/EditableInputGroup';

// hooks
import { useEditableInput } from './hooks/useEditableInput';

// styles
import styles from './editable-input.module.scss';

export type TEditableInputProps = {
  action?: ReactNode;
  ariaLabel?: string;
  autoEdit?: boolean;
  className?: string;
  editOnDoubleClick?: boolean;
  onChange: TFunc<[string]>;
  onEditingChange?: TFunc<[boolean]>;
  placeholder?: string;
  selected?: boolean;
  value: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'onChange' | 'value'>;

export const EditableInput = forwardRef<HTMLInputElement, TEditableInputProps>(
  (
    {
      action,
      ariaLabel,
      autoEdit = false,
      className = '',
      editOnDoubleClick = false,
      onChange,
      onEditingChange = noop,
      placeholder = '',
      selected = false,
      value,
      ...rest
    },
    ref,
  ) => {
    const { draft, handleBlur, handleChange, handleDisplayKeyDown, handleFocus, handleKeyDown, isEditing, startEditing } = useEditableInput(
      value,
      onChange,
      onEditingChange,
      autoEdit,
    );

    const field = isEditing ? (
      <EditableInputField
        {...rest}
        ariaLabel={ariaLabel}
        className={action ? '' : className}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={ref}
        value={draft}
      />
    ) : (
      <EditableInputDisplay
        ariaLabel={ariaLabel}
        className={cx(action ? '' : className, { [styles['EditableInput--selected']]: selected })}
        onClick={editOnDoubleClick ? undefined : startEditing}
        onDoubleClick={editOnDoubleClick ? startEditing : undefined}
        onKeyDown={handleDisplayKeyDown}
        text={value || placeholder}
      />
    );

    if (!action) {
      return field;
    }

    return <EditableInputGroup action={action} className={className} field={field} isEditing={isEditing} />;
  },
);

EditableInput.displayName = 'EditableInput';

export default EditableInput;
