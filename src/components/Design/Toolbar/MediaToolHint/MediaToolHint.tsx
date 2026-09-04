import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Snackbar, UITools } from 'shared';

// hooks
import { useMediaToolHintCloseClick } from './hooks/useMediaToolHintCloseClick';
import { useMediaToolHintPlaceAllClick } from './hooks/useMediaToolHintPlaceAllClick';

// others
import { translationNameSpace } from './constants';

// store
import { selectActiveTool, selectIsMediaToolArmed } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './media-tool-hint.module.scss';

// types
import { ToolName } from 'types/design/enums';

const MediaToolHint: FC = () => {
  const { t } = useTranslation();
  const activeTool = useAppSelector(selectActiveTool);
  const isMediaToolArmed = useAppSelector(selectIsMediaToolArmed);
  const handlePlaceAllClick = useMediaToolHintPlaceAllClick();
  const handleCloseClick = useMediaToolHintCloseClick();

  if (activeTool !== ToolName.media || !isMediaToolArmed) {
    return null;
  }

  return (
    <Snackbar className={styles.MediaToolHint}>
      <span className={styles.MediaToolHint__label}>{t(`${translationNameSpace}.clickOrDragToPlace`)}</span>
      <UITools.Button onClick={handlePlaceAllClick} variant="outline">
        {t(`${translationNameSpace}.placeAll`)}
      </UITools.Button>
      <div className={styles.MediaToolHint__separator} />
      <UITools.Button ariaLabel={t('common.close')} className={styles.MediaToolHint__close} onClick={handleCloseClick}>
        <Icon name="Close" size={24} />
      </UITools.Button>
    </Snackbar>
  );
};

export default MediaToolHint;
