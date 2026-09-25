import { FC } from 'react';

// components
import CanvasNameLabelInput from '../CanvasNameLabelInput/CanvasNameLabelInput';

// hooks
import { useSectionNameLabelEditor } from './hooks/useSectionNameLabelEditor';
import { useSectionNameLabelStyle } from './hooks/useSectionNameLabelStyle';

// others
import {
  FRAME_NAME_LABEL_FONT_SIZE_PX,
  SECTION_NAME_LABEL_CORNER_RADIUS_PX,
  SECTION_NAME_LABEL_PADDING_X_PX,
  SECTION_NAME_LABEL_PADDING_Y_PX,
} from 'constant/canvas';

// pages
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// utils
import { worldToScreen } from '../utils/worldToScreen';

const SectionNameLabelEditOverlay: FC = () => {
  const refs = useCanvasRefsContext();
  const { cancel, commit, edit, viewport } = useSectionNameLabelEditor(refs);
  const style = useSectionNameLabelStyle(edit?.nodeId);

  if (edit) {
    const left = worldToScreen({ x: edit.left, y: 0 }, viewport).x;
    const top = worldToScreen({ x: 0, y: edit.centerY }, viewport).y;

    return (
      <CanvasNameLabelInput
        angleDeg={0}
        background={style.fill}
        borderColor={style.fill}
        borderRadius={SECTION_NAME_LABEL_CORNER_RADIUS_PX}
        color={style.textFill}
        fontSize={FRAME_NAME_LABEL_FONT_SIZE_PX}
        height={edit.height * viewport.zoom}
        initialValue={edit.value}
        left={left}
        onCancel={cancel}
        onCommit={commit}
        paddingX={SECTION_NAME_LABEL_PADDING_X_PX}
        paddingY={SECTION_NAME_LABEL_PADDING_Y_PX}
        top={top}
      />
    );
  }

  return null;
};

export default SectionNameLabelEditOverlay;
