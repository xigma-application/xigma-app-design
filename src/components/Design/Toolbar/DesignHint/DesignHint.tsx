import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Snackbar } from 'shared';

// others
import { DESIGN_HINT_DURATION_MS } from './constants';

// store
import { selectDesignHintLabelKey } from 'store/design/selectors';
import { setDesignHintLabelKey } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// styles
import styles from './design-hint.module.scss';

const DesignHint: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const labelKey = useAppSelector(selectDesignHintLabelKey);

  if (!labelKey) {
    return null;
  }

  return (
    <Snackbar
      autoHideAfterMs={DESIGN_HINT_DURATION_MS}
      className={styles.DesignHint}
      onAutoHide={() => dispatch(setDesignHintLabelKey(null))}
    >
      <span className={styles.DesignHint__label}>{t(labelKey)}</span>
    </Snackbar>
  );
};

export default DesignHint;
