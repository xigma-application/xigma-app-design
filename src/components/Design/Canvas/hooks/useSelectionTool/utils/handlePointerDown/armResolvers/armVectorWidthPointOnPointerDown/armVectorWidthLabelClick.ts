// store
import { selectActivePage } from 'store/design/selectors';
import { RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getVectorWidthLabelAtPoint } from '../../../../../../utils/getVectorWidthLabelAtPoint';

export const armVectorWidthLabelClick = (
  canvasRefs: TCanvasRefs,
  point: TPoint,
  state: RootState,
  viewport: TViewport,
): true | undefined => {
  const nodes = selectActivePage(state).nodes;

  if (getVectorWidthLabelAtPoint(point, nodes, canvasRefs, viewport.zoom)) {
    return true;
  }
};
