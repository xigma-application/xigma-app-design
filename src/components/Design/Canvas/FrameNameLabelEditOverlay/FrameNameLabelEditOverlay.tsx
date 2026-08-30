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
    const left = worldToScreen({ x: edit.left, y: 0 }, viewport).x;
    const top = worldToScreen({ x: 0, y: edit.centerY }, viewport).y;

    return (
      <CanvasNameLabelInput
        fontSize={FRAME_NAME_LABEL_FONT_SIZE_PX}
        height={edit.height * viewport.zoom}
        initialValue={edit.value}
        left={left}
        onCancel={cancel}
        onCommit={commit}
        top={top}
      />
    );
  }

  return null;
};

export default FrameNameLabelEditOverlay;
