import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// hooks
import { usePositionFieldCommit } from './hooks/usePositionFieldCommit';

// styles
import styles from './position-field.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

export type TPositionFieldProps = { onCommit: TFunc<[number]>; positionPercent: number };

export const PositionField: FC<TPositionFieldProps> = ({ onCommit, positionPercent }) => {
  const { t } = useTranslation();
  const { onBlur, onKeyDown } = usePositionFieldCommit(positionPercent, onCommit);

  return (
    <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
      <div className={styles.PositionField}>
        <input
          aria-label={t('colorPicker.gradient.stops.positionAriaLabel')}
          className={styles.PositionField__input}
          defaultValue={`${positionPercent}%`}
          key={positionPercent}
          onBlur={onBlur}
          onClick={(event): void => event.currentTarget.select()}
          onKeyDown={onKeyDown}
          type="text"
        />
      </div>
    </E2EDataAttribute>
  );
};

export default PositionField;
