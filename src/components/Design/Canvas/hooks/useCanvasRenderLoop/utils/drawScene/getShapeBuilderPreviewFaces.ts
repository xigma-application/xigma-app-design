// types
import { TCanvasRefs, TVectorShapeBuilderTouchedFaces } from 'types/design/canvas/types';

export const getShapeBuilderPreviewFaces = (refs: TCanvasRefs): TVectorShapeBuilderTouchedFaces => {
  const touchedFaces = refs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current;

  if (Object.keys(touchedFaces).length > 0) {
    return touchedFaces;
  }

  const hoveredFace = refs.hover.hoveredVectorShapeBuilderFaceRef.current;

  if (hoveredFace) {
    return { [hoveredFace.nodeId]: new Set([hoveredFace.faceKey]) };
  }

  return {};
};
