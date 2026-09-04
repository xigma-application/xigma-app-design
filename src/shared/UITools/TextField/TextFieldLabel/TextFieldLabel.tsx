import { FC } from 'react';

// styles
import styles from './text-field-label.module.scss';

export type TTextFieldLabelProps = { label?: string };

export const TextFieldLabel: FC<TTextFieldLabelProps> = ({ label }) =>
  label ? <span className={styles.TextFieldLabel}>{label}</span> : null;

export default TextFieldLabel;
