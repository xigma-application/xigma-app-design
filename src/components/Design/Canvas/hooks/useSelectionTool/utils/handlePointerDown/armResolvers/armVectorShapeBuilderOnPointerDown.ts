// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { getVectorFacesOnPathAcrossOpenNodes } from '../../../../../utils/getVectorFacesOnPathAcrossOpenNodes';

export const armVectorShapeBuilderOnPointerDown = (context: TArmContext): true | undefined => {
  const { activeTool, canvas, canvasRefs, event, point, setClassName } = context;
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.shapeBuilder && vectorEditingNodeIds.length > 0) {
    const hits = getVectorFacesOnPathAcrossOpenNodes([point], vectorEditingNodeIds, state.design.nodes);

    canvasRefs.vectorShapeBuilderPathRef.current = [point];
    canvasRefs.touchedVectorShapeBuilderFacesRef.current = Object.fromEntries(
      hits.map(({ faces, node }) => [node.id, new Set(faces.map((face) => face.key))]),
    );
    canvasRefs.isVectorShapeBuilderBoxModeRef.current = event.shiftKey;
    canvasRefs.isVectorShapeBuilderSubtractRef.current = event.altKey;
    setClassName(event.altKey ? 'remove' : 'add');
    canvas.setPointerCapture(event.pointerId);

    return true;
  }
};
