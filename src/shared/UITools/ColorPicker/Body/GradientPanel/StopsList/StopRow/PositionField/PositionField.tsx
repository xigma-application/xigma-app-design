import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// hooks
import { useKeepMountedWhileFocused } from 'shared/UITools/TextField/TextFieldWrapper/hooks/useKeepMountedWhileFocused';
import { usePositionFieldCommit } from './hooks/usePositionFieldCommit';
import { useStepNumbersOnKeyDown } from 'hooks/useStepNumbersOnKeyDown/useStepNumbersOnKeyDown';

// styles
import styles from './position-field.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

export type TPositionFieldProps = { onCommit: TFunc<[number]>; positionPercent: number };

export const PositionField: FC<TPositionFieldProps> = ({ onCommit, positionPercent }) => {
  const { t } = useTranslation();
  const { onBlur, onKeyDown } = usePositionFieldCommit(positionPercent, onCommit);
  const onStepKeyDown = useStepNumbersOnKeyDown({ max: 100, min: 0, onStep: (text) => onCommit(Number(text.replace('%', ''))) });
  const { handleBlur, handleFocus, inputKey } = useKeepMountedWhileFocused(true, positionPercent, onBlur, undefined);

  return (
    <E2EDataAttribute type={E2EAttribute.bypassGlobalShortcuts} value="true">
      <div className={styles.PositionField}>
        <input
          aria-label={t('colorPicker.gradient.stops.positionAriaLabel')}
          className={styles.PositionField__input}
          defaultValue={`${positionPercent}%`}
          key={inputKey}
          onBlur={handleBlur}
          onClick={(event): void => event.currentTarget.select()}
          onFocus={handleFocus}
          onKeyDown={(event): void => {
            onStepKeyDown(event);
            onKeyDown(event);
          }}
          type="text"
        />
      </div>
    </E2EDataAttribute>
  );
};

export default PositionField;
