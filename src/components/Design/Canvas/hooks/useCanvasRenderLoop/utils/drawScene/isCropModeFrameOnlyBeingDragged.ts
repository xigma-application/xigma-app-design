// store
import { TImageEditorState } from 'store/design/types';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const isCropModeFrameOnlyBeingDragged = (refs: TCanvasRefs, id: string, imageEditor: TImageEditorState | null): boolean =>
  imageEditor?.mode === 'crop' &&
  imageEditor.nodeId === id &&
  Boolean(refs.transform.draggedNodeIdsRef.current?.has(id)) &&
  !refs.transform.resizedNodeIdsRef.current?.has(id) &&
  !refs.transform.rotatedNodeIdsRef.current?.has(id);
