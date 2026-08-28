import { FC } from 'react';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// hooks
import { useAlphaFieldCommit } from './hooks/useAlphaFieldCommit';

// styles
import styles from './alpha-field.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

export type TAlphaFieldProps = { alpha: number; onCommit: TFunc<[number]> };

export const AlphaField: FC<TAlphaFieldProps> = ({ alpha, onCommit }) => {
  const { onBlur, onKeyDown } = useAlphaFieldCommit(alpha, onCommit);

  return (
    <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
      <div className={styles.AlphaField}>
        <input
          className={styles.AlphaField__input}
          defaultValue={Math.round(alpha)}
          key={alpha}
          max={100}
          min={0}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          type="number"
        />
        <ScrubbableInput max={100} min={0} onChange={onCommit} value={Math.round(alpha)}>
          <span className={styles.AlphaField__unit}>%</span>
        </ScrubbableInput>
      </div>
    </E2EDataAttribute>
  );
};

export default AlphaField;
