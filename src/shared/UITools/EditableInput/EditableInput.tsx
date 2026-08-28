import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';
import { noop } from 'lodash';

// components
import EditableInputDisplay from './EditableInputDisplay/EditableInputDisplay';
import EditableInputField from './EditableInputField/EditableInputField';
import EditableInputGroup from './EditableInputGroup/EditableInputGroup';

// hooks
import { useEditableInput } from './hooks/useEditableInput';

export type TEditableInputProps = {
  action?: ReactNode;
  ariaLabel?: string;
  className?: string;
  onChange: TFunc<[string]>;
  onEditingChange?: TFunc<[boolean]>;
  placeholder?: string;
  value: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'onChange' | 'value'>;

export const EditableInput = forwardRef<HTMLInputElement, TEditableInputProps>(
  ({ action, ariaLabel, className = '', onChange, onEditingChange = noop, placeholder = '', value, ...rest }, ref) => {
    const { draft, handleBlur, handleChange, handleDisplayKeyDown, handleKeyDown, isEditing, startEditing } = useEditableInput(
      value,
      onChange,
      onEditingChange,
    );

    const field = isEditing ? (
      <EditableInputField
        {...rest}
        ariaLabel={ariaLabel}
        className={action ? '' : className}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={ref}
        value={draft}
      />
    ) : (
      <EditableInputDisplay
        ariaLabel={ariaLabel}
        className={action ? '' : className}
        onClick={startEditing}
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
