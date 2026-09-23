// store
import { selectImageEditor } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armRotateDrag } from '../armRotateDrag';
import { getRotateHandleAtPoint } from '../../../../../utils/getRotateHandleAtPoint';
import { getSelectionGroupHit } from '../../../../../utils/getSelectionGroupHit';

export const armRotateOnPointerDown = ({ canvas, canvasRefs, event, point, selectedNodes, viewport }: TArmContext): true | undefined => {
  const rotateHandleHit = getSelectionGroupHit(selectedNodes, (group) => getRotateHandleAtPoint(point, group, viewport));

  if (rotateHandleHit) {
    const imageEditor = selectImageEditor(store.getState());

    if (
      imageEditor?.mode !== 'crop' ||
      imageEditor.selectedTarget !== 'image' ||
      !selectedNodes.some((node) => node.id === imageEditor.nodeId)
    ) {
      armRotateDrag(
        canvas,
        event,
        canvasRefs.transform.rotateDragRef,
        rotateHandleHit.group,
        rotateHandleHit.bounds,
        rotateHandleHit.rotation,
        point,
        canvasRefs,
      );

      return true;
    }
  }
};
