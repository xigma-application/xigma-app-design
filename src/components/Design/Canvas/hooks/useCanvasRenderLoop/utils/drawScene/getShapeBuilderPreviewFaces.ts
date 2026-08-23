// types
import { TCanvasRefs, TVectorShapeBuilderTouchedFaces } from 'types/design/canvas/types';

export const getShapeBuilderPreviewFaces = (refs: TCanvasRefs): TVectorShapeBuilderTouchedFaces => {
  const touchedFaces = refs.touchedVectorShapeBuilderFacesRef.current;

  if (Object.keys(touchedFaces).length > 0) {
    return touchedFaces;
  }

  const hoveredFace = refs.hoveredVectorShapeBuilderFaceRef.current;

  if (hoveredFace) {
    return { [hoveredFace.nodeId]: new Set([hoveredFace.faceKey]) };
  }

  return {};
};
