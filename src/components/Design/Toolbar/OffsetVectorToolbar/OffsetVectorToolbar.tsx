import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, UITools } from 'shared';

// hooks
import { useOffsetVectorToolbar } from './hooks/useOffsetVectorToolbar';

// others
import { OFFSET_VECTOR_INPUT_MAX, OFFSET_VECTOR_SLIDER_MAX, translationNameSpace } from './constants';

// styles
import styles from './offset-vector-toolbar.module.scss';

// utils
import { getOffsetVectorJoinButtons } from './utils/getOffsetVectorJoinButtons';

const OffsetVectorToolbar: FC = () => {
  const { t } = useTranslation();
  const { distance, isVisible, join, onCancel, onConfirm, onDistanceChange, onJoinChange } = useOffsetVectorToolbar();

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.OffsetVectorToolbar}>
      <span className={styles.OffsetVectorToolbar__label}>{t(`${translationNameSpace}.label`)}</span>
      <div className={styles.OffsetVectorToolbar__separator} />
      <UITools.SliderInput
        ariaLabel={t(`${translationNameSpace}.distance`)}
        className={styles.OffsetVectorToolbar__distance}
        e2eValue="offset-vector-distance"
        inputMax={OFFSET_VECTOR_INPUT_MAX}
        inputPosition="start"
        max={OFFSET_VECTOR_SLIDER_MAX}
        min={0}
        onChange={onDistanceChange}
        value={distance}
      />
      <UITools.ToggleButtonGroup
        onChange={onJoinChange}
        toggleButtons={getOffsetVectorJoinButtons((join) => t(`${translationNameSpace}.${join}`))}
        value={join}
      />
      <div className={styles.OffsetVectorToolbar__separator} />
      <UITools.Button color="secondary" onClick={onCancel} size="small" variant="outline">
        {t('common.cancel')}
      </UITools.Button>
      <UITools.Button ariaLabel={t(`${translationNameSpace}.confirm`)} onClick={onConfirm} size="small">
        <Icon color="onBlue1" name="Check" size={16} />
      </UITools.Button>
    </div>
  );
};

export default OffsetVectorToolbar;
