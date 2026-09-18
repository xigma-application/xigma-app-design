import { FC, ReactNode } from 'react';

// styles
import styles from './stroke-settings-basic-tab.module.scss';

export type TStrokeSettingsFieldProps = {
  children: ReactNode;
  label: string;
};

export const StrokeSettingsField: FC<TStrokeSettingsFieldProps> = ({ children, label }) => (
  <div className={styles.StrokeSettingsBasicTab__row}>
    <span className={styles.StrokeSettingsBasicTab__label}>{label}</span>
    <div className={styles.StrokeSettingsBasicTab__control}>{children}</div>
  </div>
);

export default StrokeSettingsField;
