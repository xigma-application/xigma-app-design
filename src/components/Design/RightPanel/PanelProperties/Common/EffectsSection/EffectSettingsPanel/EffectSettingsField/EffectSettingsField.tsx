import { FC, ReactNode } from 'react';

// styles
import styles from './effect-settings-field.module.scss';

export type TEffectSettingsFieldProps = {
  children: ReactNode;
  label?: string;
};

export const EffectSettingsField: FC<TEffectSettingsFieldProps> = ({ children, label }) => (
  <div className={styles.EffectSettingsField}>
    <span className={styles.EffectSettingsField__label}>{label}</span>
    <div className={styles.EffectSettingsField__control}>{children}</div>
  </div>
);

export default EffectSettingsField;
