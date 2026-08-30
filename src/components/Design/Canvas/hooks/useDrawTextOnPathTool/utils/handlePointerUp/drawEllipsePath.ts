// others
import { PATH_NAME, PATH_START_OFFSET_TOP } from '../../../../constants';

// store
import { addNode, setSelection, startTextEdit } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType, PathType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';

export const drawEllipsePath = (rect: TDraftRect, dispatch: AppDispatch): void => {
  dispatch(addNode({ ...rect, name: PATH_NAME, parentId: null, pathType: PathType.ellipse, rotation: 0, type: NodeType.path }));

  const { rootOrder } = selectActivePage(store.getState());
  const pathNodeId = rootOrder[rootOrder.length - 1];

  dispatch(setSelection([pathNodeId]));
  dispatch(
    startTextEdit({
      box: {
        ...rect,
        flipX: false,
        flipY: false,
        pathFlip: false,
        pathId: pathNodeId,
        pathStartOffset: PATH_START_OFFSET_TOP,
        rotation: 0,
      },
    }),
  );
};
