// store
import { RootState } from 'store';
import { selectNodes, selectViewport } from 'store/design/selectors';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

// utils
import { getGridTrackValueEditGeometry } from 'utils/canvas/gridSlots/getGridTrackValueEditGeometry';

export const commitGridTrackValueLiveChange = (
  refs: TCanvasRefs,
  state: RootState,
  edit: TGridTrackValueEditTarget,
  raw: string,
): TGridTrackValueEditTarget => {
  const frame = selectNodes(state)[edit.frameId];
  let nextEdit = edit;

  if (frame && frame.type === NodeType.frame) {
    const geometry = getGridTrackValueEditGeometry(edit.pillCenter, raw || ' ', selectViewport(state).zoom, frame);

    if (geometry) {
      nextEdit = { ...edit, ...geometry };
    }
  }

  refs.hover.editingGridTrackValueRef.current = { axis: edit.axis, frameId: edit.frameId, index: edit.index, text: raw };
  return nextEdit;
};
