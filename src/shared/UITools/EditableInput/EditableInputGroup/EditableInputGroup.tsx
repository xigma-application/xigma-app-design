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
  className?: string;
  field: ReactElement;
  isEditing: boolean;
};

export const EditableInputGroup: FC<TEditableInputGroupProps> = ({ action, className = '', field, isEditing }) => {
  const { actionRef, isActionOpen, toggleAction } = useEditableInputActionToggle();

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
            onClick={toggleAction}
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
