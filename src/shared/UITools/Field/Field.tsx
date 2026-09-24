import cx from 'classnames';
import { ComponentProps, ElementType, ReactElement } from 'react';

// styles
import styles from './field.module.scss';

export type TFieldOwnProps<TComponent extends ElementType> = {
  Component: TComponent;
  className?: string;
  controlWidth?: number;
  label?: string;
  labelInside?: boolean;
};

export type TFieldProps<TComponent extends ElementType> = TFieldOwnProps<TComponent> &
  Omit<ComponentProps<TComponent>, keyof TFieldOwnProps<TComponent>>;

export const Field = <TComponent extends ElementType>({
  Component,
  className,
  controlWidth,
  label,
  labelInside = false,
  ...componentProps
}: TFieldProps<TComponent>): ReactElement => {
  const Control: ElementType = Component;

  return (
    <div className={styles.Field}>
      {!labelInside && <span className={styles.Field__label}>{label}</span>}
      <div
        className={cx(styles.Field__control, { [styles['Field__control--inside']]: labelInside })}
        style={controlWidth ? { flex: `0 0 ${controlWidth}px`, width: controlWidth } : undefined}
      >
        {labelInside ? (
          <Control {...componentProps} className={className} label={label} />
        ) : (
          <Control {...componentProps} className={cx(styles.Field__component, className)} />
        )}
      </div>
    </div>
  );
};

export default Field;
