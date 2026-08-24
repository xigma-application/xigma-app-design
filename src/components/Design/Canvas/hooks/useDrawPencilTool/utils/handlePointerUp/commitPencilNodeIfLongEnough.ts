// others
import { MIN_SHAPE_SIZE, PENCIL_NAME, PENCIL_STROKE, PENCIL_STROKE_WIDTH, PENCIL_TANGENT_TENSION } from '../../../../constants';

// store
import { addNode } from 'store/design/slice';
import { AppDispatch, AppStore } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { buildVectorNetworkFromPoints } from './buildVectorNetworkFromPoints';
import { getPathLength } from '../getPathLength';
import { selectLastCreatedNode } from '../../../../utils/selectLastCreatedNode';

export const commitPencilNodeIfLongEnough = (dispatch: AppDispatch, appStore: AppStore, finalPoints: TPoint[]): void => {
  if (finalPoints.length > 1 && getPathLength(finalPoints) >= MIN_SHAPE_SIZE) {
    const { segments, vertexHandleModes, vertices } = buildVectorNetworkFromPoints(finalPoints, PENCIL_TANGENT_TENSION);

    dispatch(
      addNode({
        capStyle: 'round',
        fillColor: null,
        filledFaceKeys: [],
        name: PENCIL_NAME,
        parentId: null,
        rotation: 0,
        segments,
        strokeColor: PENCIL_STROKE,
        strokeWidth: PENCIL_STROKE_WIDTH,
        type: NodeType.vector,
        vertexHandleModes,
        vertices,
      }),
    );
    selectLastCreatedNode(dispatch, appStore);
  }
};
