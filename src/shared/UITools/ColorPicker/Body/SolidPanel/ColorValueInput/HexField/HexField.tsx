import { FC } from 'react';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// hooks
import { useHexFieldCommit } from './hooks/useHexFieldCommit';

// styles
import styles from './hex-field.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

export type THexFieldProps = { hex: string; onCommit: TFunc<[string]> };

export const HexField: FC<THexFieldProps> = ({ hex, onCommit }) => {
  const { inputRef, onBlur, onKeyDown } = useHexFieldCommit(hex, onCommit);

  return (
    <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
      <input
        className={styles.HexField}
        defaultValue={hex.replace('#', '')}
        key={hex}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        ref={inputRef}
      />
    </E2EDataAttribute>
  );
};

export default HexField;
