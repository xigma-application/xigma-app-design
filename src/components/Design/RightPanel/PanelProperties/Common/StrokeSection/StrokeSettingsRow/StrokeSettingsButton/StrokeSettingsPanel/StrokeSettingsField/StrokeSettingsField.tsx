import { FC, ReactNode } from 'react';

// styles
import styles from './stroke-settings-field.module.scss';

export type TStrokeSettingsFieldProps = {
  children: ReactNode;
  label: string;
};

export const StrokeSettingsField: FC<TStrokeSettingsFieldProps> = ({ children, label }) => (
  <div className={styles.StrokeSettingsField__row}>
    <span className={styles.StrokeSettingsField__label}>{label}</span>
    <div className={styles.StrokeSettingsField__control}>{children}</div>
  </div>
);

export default StrokeSettingsField;
