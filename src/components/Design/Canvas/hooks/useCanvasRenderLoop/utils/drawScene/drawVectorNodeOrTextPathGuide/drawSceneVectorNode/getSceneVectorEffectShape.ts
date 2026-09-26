// types
import { TBooleanShape } from '../../drawBooleanLeafNode/types';
import { TVectorNode } from 'types/design/types';
import { TVectorSnapshotsRefs } from 'types/design/canvas/types';

// utils
import { getVectorEffectShape } from './getVectorEffectShape';
import { getVectorNodeEffectShape } from './getVectorNodeEffectShape';
import { hasVectorShapeEffects } from 'utils/canvas/vector/effects/hasVectorShapeEffects';
import { mapVectorEffectLayers } from './mapVectorEffectLayers';
import { rotateSnapshotPoint } from './drawVectorNodeRotateSnapshot/rotateSnapshotPoint';
import { scalePoint } from './drawVectorNodeResizeSnapshot/scalePoint';

const getSnapshotEffectShape = (node: TVectorNode, vectorSnapshots: TVectorSnapshotsRefs): TBooleanShape => {
  const dragSnapshot = vectorSnapshots.draggedVectorNodeSnapshotsRef.current?.get(node.id);
  const resizeSnapshot = vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.get(node.id);
  const rotateSnapshot = vectorSnapshots.rotatedVectorNodeSnapshotsRef.current?.get(node.id);

  switch (true) {
    case Boolean(dragSnapshot): {
      const { deltaX, deltaY, effectLayers = [] } = dragSnapshot!;

      return getVectorEffectShape(
        mapVectorEffectLayers(effectLayers, (point) => ({ x: point.x + deltaX, y: point.y + deltaY })),
        getVectorNodeEffectShape(node).key,
      );
    }
    case Boolean(resizeSnapshot):
      return getVectorEffectShape(mapVectorEffectLayers(resizeSnapshot!.effectLayers ?? [], (point) => scalePoint(point, resizeSnapshot!)));
    case Boolean(rotateSnapshot):
      return getVectorEffectShape(
        mapVectorEffectLayers(rotateSnapshot!.effectLayers ?? [], (point) => rotateSnapshotPoint(point, rotateSnapshot!)),
      );
    default:
      return getVectorNodeEffectShape(node);
  }
};

export const getSceneVectorEffectShape = (node: TVectorNode, vectorSnapshots: TVectorSnapshotsRefs): TBooleanShape | null =>
  hasVectorShapeEffects(node) ? getSnapshotEffectShape(node, vectorSnapshots) : null;
