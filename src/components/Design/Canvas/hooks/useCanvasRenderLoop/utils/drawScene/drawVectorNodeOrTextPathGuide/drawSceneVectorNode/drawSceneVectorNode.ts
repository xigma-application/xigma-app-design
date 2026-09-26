// types
import { EffectType } from 'types/design/enums';
import { TBooleanShape } from '../../drawBooleanLeafNode/types';
import { TCanvasRefs, TVectorSnapshotsRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TDrawableBoxEffectType } from '../../drawBoxLeafNode/getBoxEffectDrawer';
import { TVectorNode } from 'types/design/types';

// utils
import { drawBooleanEffects } from '../../drawBooleanLeafNode/drawBooleanEffects';
import { drawVectorNode } from './drawVectorNode';
import { drawVectorNodeDragSnapshot } from './drawVectorNodeDragSnapshot';
import { drawVectorNodeResizeSnapshot } from './drawVectorNodeResizeSnapshot/drawVectorNodeResizeSnapshot';
import { drawVectorNodeRotateSnapshot } from './drawVectorNodeRotateSnapshot/drawVectorNodeRotateSnapshot';
import { getSceneVectorEffectShape } from './getSceneVectorEffectShape';
import { withSnapshotFacesOpacity } from './withSnapshotFacesOpacity';

const drawVectorNodeOrSnapshot = (
  context: TDrawSceneContext,
  node: TVectorNode,
  vectorSnapshots: TVectorSnapshotsRefs,
  opacity: number,
): void => {
  const dragSnapshot = vectorSnapshots.draggedVectorNodeSnapshotsRef.current?.get(node.id);
  const resizeSnapshot = vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.get(node.id);
  const rotateSnapshot = vectorSnapshots.rotatedVectorNodeSnapshotsRef.current?.get(node.id);

  switch (true) {
    case Boolean(dragSnapshot):
      drawVectorNodeDragSnapshot(context, withSnapshotFacesOpacity(dragSnapshot!, opacity), opacity);
      break;
    case Boolean(resizeSnapshot):
      drawVectorNodeResizeSnapshot(context, withSnapshotFacesOpacity(resizeSnapshot!, opacity), opacity);
      break;
    case Boolean(rotateSnapshot):
      drawVectorNodeRotateSnapshot(context, withSnapshotFacesOpacity(rotateSnapshot!, opacity), opacity);
      break;
    default:
      drawVectorNode(context, node, opacity);
  }
};

const drawEffects = (
  context: TDrawSceneContext,
  node: TVectorNode,
  effectShape: TBooleanShape | null,
  opacity: number,
  refs: TCanvasRefs,
  type: TDrawableBoxEffectType,
): void => {
  if (effectShape) {
    drawBooleanEffects(context, node, effectShape, opacity, refs, type);
  }
};

export const drawSceneVectorNode = (context: TDrawSceneContext, node: TVectorNode, refs: TCanvasRefs, opacity = 1): void => {
  const { vectorSnapshots } = refs;
  const effectShape = getSceneVectorEffectShape(node, vectorSnapshots);

  drawEffects(context, node, effectShape, opacity, refs, EffectType.dropShadow);
  drawVectorNodeOrSnapshot(context, node, vectorSnapshots, opacity);
  drawEffects(context, node, effectShape, opacity, refs, EffectType.innerShadow);
  drawEffects(context, node, effectShape, opacity, refs, EffectType.noise);
};
