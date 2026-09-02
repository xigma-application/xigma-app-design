// store
import { AppDispatch } from 'store';

// types
import { TVectorPaintTouchedLoopKeys } from 'types/design/canvas/types';
import { TPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { addNodeAlongPath } from './addNodeAlongPath';
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';
import { getVectorFacesOnPath } from '../../../../../utils/getVectorFacesOnPath';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { persistVectorNetworkCrossings } from 'utils/canvas/vectorNetwork/planarizeVectorNetwork/persistVectorNetworkCrossings';
import { removeNodeAlongPath } from './removeNodeAlongPath';

export const paintNodeAlongPath = (
  dispatch: AppDispatch,
  node: TVectorNode,
  path: TPoint[],
  paint: TPaint,
  isRemoveMode: boolean,
  touchedLoopKeys: TVectorPaintTouchedLoopKeys,
): string[] => {
  const { segments, vertices } = persistVectorNetworkCrossings(node.segments, node.vertices);
  const geometryChanged = segments !== node.segments;
  const persistedNode = { ...node, segments, vertices };
  const bakedNode = { ...persistedNode, ...bakeVectorNodeRotation(persistedNode) };
  const touched = touchedLoopKeys[node.id] ?? new Set<string>();
  const facesOnPath = getVectorFacesOnPath(bakedNode, path);
  const loopKeysOnPath = facesOnPath.map((face) => getVectorFillLoopKey(face.pieceKeys)).filter((key) => !touched.has(key));

  touchedLoopKeys[node.id] = touched;
  loopKeysOnPath.forEach((key) => touched.add(key));

  if (isRemoveMode) {
    removeNodeAlongPath(dispatch, persistedNode, loopKeysOnPath, geometryChanged, segments, vertices);
  } else {
    addNodeAlongPath(dispatch, persistedNode, loopKeysOnPath, paint, geometryChanged, segments, vertices);
  }

  return facesOnPath.map((face) => face.key);
};
