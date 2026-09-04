import cx from 'classnames';
import { FC } from 'react';

// components
import TextFieldLabel from './TextFieldLabel/TextFieldLabel';
import TextFieldWrapper, { TTextFieldWrapperProps } from './TextFieldWrapper/TextFieldWrapper';

// styles
import styles from './text-field.module.scss';

export type TTextFieldProps = TTextFieldWrapperProps & {
  className?: string;
  label?: string;
};

export const TextField: FC<TTextFieldProps> = ({ className = '', label, ...wrapperProps }) => (
  <div className={cx(styles.TextField, className)}>
    <TextFieldLabel label={label} />
    <TextFieldWrapper {...wrapperProps} />
  </div>
);

export default TextField;
