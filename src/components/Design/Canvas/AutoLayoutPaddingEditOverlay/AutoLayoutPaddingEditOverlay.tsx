import { FC } from 'react';

// components
import AutoLayoutPaddingValueInput from './AutoLayoutPaddingValueInput/AutoLayoutPaddingValueInput';

// hooks
import { useAutoLayoutPaddingEditor } from './hooks/useAutoLayoutPaddingEditor';

// pages
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

const AutoLayoutPaddingEditOverlay: FC = () => {
  const refs = useCanvasRefsContext();
  const { cancel, commit, edit } = useAutoLayoutPaddingEditor(refs);

  if (edit) {
    return (
      <AutoLayoutPaddingValueInput
        centerX={edit.centerX}
        centerY={edit.centerY}
        iconName={edit.iconName}
        initialValue={edit.initialValue}
        onCancel={cancel}
        onCommit={commit}
      />
    );
  }

  return null;
};

export default AutoLayoutPaddingEditOverlay;
