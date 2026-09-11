import { FC } from 'react';

// components
import CanvasValueLabelInput from '../CanvasValueLabelInput/CanvasValueLabelInput';

// hooks
import { useGridTrackValueLabelEditor } from './hooks/useGridTrackValueLabelEditor/useGridTrackValueLabelEditor';

// others
import { VALUE_LABEL_FONT_SIZE_PX } from 'constant/canvas';

// pages
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// styles
import styles from './GridTrackValueLabelEditOverlay.module.scss';

// utils
import { worldToScreen } from '../utils/worldToScreen';

const GridTrackValueLabelEditOverlay: FC = () => {
  const refs = useCanvasRefsContext();
  const { cancel, commit, edit, liveChange, viewport } = useGridTrackValueLabelEditor(refs);

  if (edit) {
    const screen = worldToScreen(edit.center, viewport);

    return (
      <CanvasValueLabelInput
        centerX={screen.x}
        centerY={screen.y}
        className={styles.GridTrackValueLabelEditOverlay__input}
        fontSize={VALUE_LABEL_FONT_SIZE_PX}
        height={edit.badgeHeight * viewport.zoom}
        initialValue={edit.value}
        minWidth={edit.badgeWidth * viewport.zoom}
        onCancel={cancel}
        onCommit={commit}
        onLiveChange={liveChange}
      />
    );
  }

  return null;
};

export default GridTrackValueLabelEditOverlay;
