import { FC, ReactNode } from 'react';

// styles
import styles from './effect-settings-field.module.scss';

export type TEffectSettingsFieldProps = {
  children: ReactNode;
  controlWidth?: number;
  label?: string;
};

export const EffectSettingsField: FC<TEffectSettingsFieldProps> = ({ children, controlWidth, label }) => (
  <div className={styles.EffectSettingsField}>
    <span className={styles.EffectSettingsField__label}>{label}</span>
    <div
      className={styles.EffectSettingsField__control}
      style={controlWidth ? { flex: `0 0 ${controlWidth}px`, width: controlWidth } : undefined}
    >
      {children}
    </div>
  </div>
);

export default EffectSettingsField;
