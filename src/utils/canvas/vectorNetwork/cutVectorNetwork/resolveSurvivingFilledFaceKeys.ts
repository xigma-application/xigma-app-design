// types
import { NodeType } from 'types/design/enums';
import { TVectorNetworkComponent } from './types';

// utils
import { getVectorFillLoopPoints } from '../getVectorFillLoopPoints/getVectorFillLoopPoints';

export const resolveSurvivingFilledFaceKeys = (originalKeys: string[], component: TVectorNetworkComponent): string[] =>
  originalKeys.filter(
    (key) =>
      getVectorFillLoopPoints(
        {
          fillColor: null,
          filledFaceKeys: [],
          id: '__cut-fill-survivor-probe',
          name: '',
          parentId: null,
          rotation: 0,
          segments: component.segments,
          strokeColor: '#000000',
          strokeWidth: 1,
          type: NodeType.vector,
          vertexHandleModes: component.vertexHandleModes,
          vertices: component.vertices,
        },
        key,
      ) !== null,
  );
