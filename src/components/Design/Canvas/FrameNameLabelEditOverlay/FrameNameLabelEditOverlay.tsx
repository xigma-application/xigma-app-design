import { FC } from 'react';

// components
import CanvasNameLabelInput from '../CanvasNameLabelInput/CanvasNameLabelInput';

// hooks
import { useFrameNameLabelEditor } from './hooks/useFrameNameLabelEditor';

// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX } from 'constant/canvas';

// pages
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// utils
import { worldToScreen } from '../utils/worldToScreen';

const FrameNameLabelEditOverlay: FC = () => {
  const refs = useCanvasRefsContext();
  const { cancel, commit, edit, viewport } = useFrameNameLabelEditor(refs);

  if (edit) {
    const screen = worldToScreen(edit.center, viewport);

    return (
      <CanvasNameLabelInput
        centerX={screen.x}
        centerY={screen.y}
        fontSize={FRAME_NAME_LABEL_FONT_SIZE_PX}
        height={edit.height * viewport.zoom}
        initialValue={edit.value}
        minWidth={edit.width * viewport.zoom}
        onCancel={cancel}
        onCommit={commit}
      />
    );
  }

  return null;
};

export default FrameNameLabelEditOverlay;
