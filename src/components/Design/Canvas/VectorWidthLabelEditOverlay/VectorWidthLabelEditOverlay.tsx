import { FC } from 'react';

// components
import CanvasValueLabelInput from '../CanvasValueLabelInput/CanvasValueLabelInput';

// hooks
import { useVectorWidthLabelEditor } from './hooks/useVectorWidthLabelEditor';

// others
import { VALUE_LABEL_FONT_SIZE_PX } from 'constant/canvas';

// pages
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// utils
import { worldToScreen } from '../utils/worldToScreen';

const VectorWidthLabelEditOverlay: FC = () => {
  const refs = useCanvasRefsContext();
  const { cancel, commit, edit, viewport } = useVectorWidthLabelEditor(refs);

  if (edit) {
    const screen = worldToScreen(edit.center, viewport);

    return (
      <CanvasValueLabelInput
        centerX={screen.x}
        centerY={screen.y}
        fontSize={VALUE_LABEL_FONT_SIZE_PX}
        height={edit.badgeHeight * viewport.zoom}
        initialValue={edit.value}
        minWidth={edit.badgeWidth * viewport.zoom}
        onCancel={cancel}
        onCommit={commit}
      />
    );
  }

  return null;
};

export default VectorWidthLabelEditOverlay;
