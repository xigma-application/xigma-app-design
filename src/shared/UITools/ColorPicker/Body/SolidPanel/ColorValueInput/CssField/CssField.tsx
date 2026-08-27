import { FC } from 'react';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// hooks
import { useCssFieldCommit } from './hooks/useCssFieldCommit';

// styles
import styles from './css-field.module.scss';

// types
import { TColorPickerValue } from '../../../../types';
import { E2EAttribute } from 'types/e2e';

export type TCssFieldProps = { onCommit: TFunc<[TColorPickerValue]>; value: string };

export const CssField: FC<TCssFieldProps> = ({ onCommit, value }) => {
  const { inputRef, onBlur, onKeyDown } = useCssFieldCommit(value, onCommit);

  return (
    <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
      <input className={styles.CssField} defaultValue={value} key={value} onBlur={onBlur} onKeyDown={onKeyDown} ref={inputRef} />
    </E2EDataAttribute>
  );
};

export default CssField;
