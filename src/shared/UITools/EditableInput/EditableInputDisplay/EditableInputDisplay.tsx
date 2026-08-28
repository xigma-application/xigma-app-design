import cx from 'classnames';
import { FC, KeyboardEvent } from 'react';

// styles
import styles from '../editable-input.module.scss';

export type TEditableInputDisplayProps = {
  ariaLabel?: string;
  className?: string;
  onClick?: TFunc;
  onDoubleClick?: TFunc;
  onKeyDown: TFunc<[KeyboardEvent<HTMLElement>]>;
  text: string;
};

export const EditableInputDisplay: FC<TEditableInputDisplayProps> = ({
  ariaLabel,
  className = '',
  onClick,
  onDoubleClick,
  onKeyDown,
  text,
}) => (
  <div
    aria-label={ariaLabel}
    className={cx(styles.EditableInput, styles['EditableInput--display'], className)}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    onKeyDown={onKeyDown}
    role="button"
    tabIndex={0}
  >
    <span className={styles.EditableInput__text}>{text}</span>
  </div>
);

export default EditableInputDisplay;
