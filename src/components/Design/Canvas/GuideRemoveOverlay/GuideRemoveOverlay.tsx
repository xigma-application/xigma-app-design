import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// hooks
import { useGuideTool } from '../hooks/useGuideTool/useGuideTool';

// others
import { translationNameSpace } from './constants';

// pages
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { selectViewport } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './guide-remove-overlay.module.scss';

// utils
import { worldToScreen } from '../utils/worldToScreen';

const GuideRemoveOverlay: FC = () => {
  const { t } = useTranslation();
  const refs = useCanvasRefsContext();
  const { removeSelectedGuide, selectedGuide } = useGuideTool(refs);
  const viewport = useAppSelector(selectViewport);

  if (!selectedGuide) {
    return null;
  }

  const screenPoint = worldToScreen(selectedGuide.worldPoint, viewport);

  return (
    <div className={styles.GuideRemoveOverlay} style={{ left: screenPoint.x, top: screenPoint.y }}>
      <button className={styles.GuideRemoveOverlay__button} onClick={removeSelectedGuide} type="button">
        {t(`${translationNameSpace}.remove`)}
      </button>
    </div>
  );
};

export default GuideRemoveOverlay;
