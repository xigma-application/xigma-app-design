// store
import { addNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';

// utils
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const dispatchShapeNode = (
  dispatch: AppDispatch,
  rect: TDraftRect,
  fill: string,
  name: string,
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section,
): void => {
  switch (type) {
    case NodeType.frame:
      dispatch(
        addNode({ ...rect, childIds: [], clipContent: true, fills: [makeSolidPaint(fill)], name, parentId: null, rotation: 0, type }),
      );
      break;
    case NodeType.section:
      dispatch(addNode({ ...rect, childIds: [], fill, name, parentId: null, rotation: 0, type }));
      break;
    case NodeType.rectangle:
      dispatch(addNode({ ...rect, fills: [makeSolidPaint(fill)], name, parentId: null, rotation: 0, type }));
      break;
    default:
      dispatch(addNode({ ...rect, fill, name, parentId: null, rotation: 0, type }));
  }
};
