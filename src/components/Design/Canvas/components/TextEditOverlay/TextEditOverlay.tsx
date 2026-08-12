import { FC, useEffect, useRef } from 'react';

// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FILL, TEXT_FONT_FAMILY, TEXT_FONT_SIZE } from '../../constants';

// hooks
import { useBlockShortcutPropagation } from './hooks/useBlockShortcutPropagation';
import { useCommitTextEdit } from './hooks/useCommitTextEdit';
import { useTextEditInput } from './hooks/useTextEditInput';

// store
import { selectEditingTextBox, selectViewport } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './TextEditOverlay.module.scss';

// utils
import { worldToScreen } from '../../utils/worldToScreen';

const TextEditOverlay: FC = () => {
  const box = useAppSelector(selectEditingTextBox);
  const elementRef = useRef<HTMLDivElement>(null);
  const handleBlur = useCommitTextEdit(box);
  const handleInput = useTextEditInput();
  const handleKeyDown = useBlockShortcutPropagation();
  const viewport = useAppSelector(selectViewport);

  useEffect(() => {
    if (box) {
      elementRef.current?.focus();
    }
  }, [box]);

  if (box) {
    const screen = worldToScreen(box, viewport);

    return (
      <div
        className={styles.TextEditOverlay}
        contentEditable
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        ref={elementRef}
        style={{
          caretColor: TEXT_FILL,
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
