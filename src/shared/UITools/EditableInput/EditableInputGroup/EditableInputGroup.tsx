import cx from 'classnames';
import { FC, ReactElement, ReactNode } from 'react';

// components
import FieldGroup from '../../FieldGroup/FieldGroup';

// hooks
import { useEditableInputActionToggle } from '../hooks/useEditableInputActionToggle';

// styles
import styles from '../editable-input.module.scss';

export type TEditableInputGroupProps = {
  action: ReactNode;
  actionOpen?: boolean;
  className?: string;
  field: ReactElement;
  isEditing: boolean;
  onActionOpenChange?: TFunc<[boolean]>;
};

export const EditableInputGroup: FC<TEditableInputGroupProps> = ({
  action,
  actionOpen,
  className = '',
  field,
  isEditing,
  onActionOpenChange,
}) => {
  const isControlled = actionOpen !== undefined;
  const { actionRef, isActionOpen, toggleAction } = useEditableInputActionToggle(actionOpen, onActionOpenChange);

  return (
    <FieldGroup className={cx(styles.EditableInput__group, className)}>
      {isEditing ? (
        field
      ) : (
        <div className={styles.EditableInput__content}>
          {field}
          <div
            className={styles.EditableInput__action}
            data-state={isActionOpen ? 'open' : 'closed'}
            onClick={isControlled ? undefined : toggleAction}
            ref={actionRef}
          >
            {action}
          </div>
        </div>
      )}
    </FieldGroup>
  );
};

export default EditableInputGroup;
