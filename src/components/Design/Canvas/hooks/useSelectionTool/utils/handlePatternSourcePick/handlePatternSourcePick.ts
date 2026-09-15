// utils
import { getNodeAtPoint } from 'components/Design/Canvas/utils/getNodeAtPoint/getNodeAtPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

// store
import { selectNodes, selectOrderedNodes, selectPatternSourcePickTarget, selectViewport } from 'store/design/selectors';
import { setPatternSourcePicking, updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { MouseButton } from 'types/enums';
import { TPaint } from 'types/design/paint/types';

export const handlePatternSourcePick = (canvas: HTMLCanvasElement, event: PointerEvent, dispatch: AppDispatch): void => {
  if (event.button === MouseButton.primary) {
    const state = store.getState();
    const target = selectPatternSourcePickTarget(state);

    if (target) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);

      if (hit && hit.id !== target.nodeId) {
        const targetNode = selectNodes(state)[target.nodeId];

        if (targetNode && 'fills' in targetNode) {
          const paint = targetNode.fills[target.paintIndex];

          if (paint && paint.type === 'pattern') {
            const nextFills: TPaint[] = targetNode.fills.map((fill, index) =>
              index === target.paintIndex ? { ...paint, frozenSourceSnapshot: null, sourceNodeId: hit.id } : fill,
            );

            dispatch(updateNode({ changes: { fills: nextFills }, id: target.nodeId }));
          }
        }
      }

      dispatch(setPatternSourcePicking(false));
    }
  }
};
