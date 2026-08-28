import cx from 'classnames';
import { FC, ReactElement, ReactNode } from 'react';

// components
import FieldGroup from '../../FieldGroup/FieldGroup';

// styles
import styles from '../editable-input.module.scss';

export type TEditableInputGroupProps = {
  action: ReactNode;
  className?: string;
  field: ReactElement;
  isEditing: boolean;
};

export const EditableInputGroup: FC<TEditableInputGroupProps> = ({ action, className = '', field, isEditing }) => (
  <FieldGroup className={cx(styles.EditableInput__group, className)}>
    {isEditing ? (
      field
    ) : (
      <div className={styles.EditableInput__content}>
        {field}
        <div className={styles.EditableInput__action}>{action}</div>
      </div>
    )}
  </FieldGroup>
);

export default EditableInputGroup;
