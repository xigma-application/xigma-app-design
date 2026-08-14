import { FC, useRef } from 'react';

// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_FAMILY, TEXT_FONT_SIZE } from '../../constants';

// hooks
import { useBlockShortcutPropagation } from './hooks/useBlockShortcutPropagation';
import { useCommitTextEdit } from './hooks/useCommitTextEdit';
import { useSeedEditableTextOnEntry } from './hooks/useSeedEditableTextOnEntry';
import { useTextEditInput } from './hooks/useTextEditInput';
import { useTrackTextEditSelection } from './hooks/useTrackTextEditSelection';

// store
import { selectEditingNodeId, selectEditingTextBox, selectEditingTextContent, selectViewport } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './TextEditOverlay.module.scss';

// utils
import { worldToScreen } from '../../utils/worldToScreen';

const TextEditOverlay: FC = () => {
  const box = useAppSelector(selectEditingTextBox);
  const editingNodeId = useAppSelector(selectEditingNodeId);
  const editingTextContent = useAppSelector(selectEditingTextContent);
  const elementRef = useRef<HTMLDivElement>(null);
  const handleBlur = useCommitTextEdit(box, editingNodeId);
  const handleInput = useTextEditInput();
  const handleKeyDown = useBlockShortcutPropagation();
  const handleSelect = useTrackTextEditSelection();
  const viewport = useAppSelector(selectViewport);

  useSeedEditableTextOnEntry(elementRef, box, editingNodeId, editingTextContent);

  if (box) {
    const screen = worldToScreen(box, viewport);

    return (
      <div
        className={styles.TextEditOverlay}
        contentEditable
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        ref={elementRef}
        style={{
          caretColor: 'transparent',
          color: 'transparent',
          fontFamily: TEXT_FONT_FAMILY,
          fontSize: TEXT_FONT_SIZE * viewport.zoom,
          left: screen.x,
          lineHeight: MSDF_ATLAS_JSON.common.lineHeight / MSDF_ATLAS_JSON.info.size,
          top: screen.y,
          width: box.width * viewport.zoom,
        }}
      />
    );
  }

  return null;
};

export default TextEditOverlay;
