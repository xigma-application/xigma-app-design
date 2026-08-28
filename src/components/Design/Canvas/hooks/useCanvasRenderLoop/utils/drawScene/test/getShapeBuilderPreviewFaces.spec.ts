// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getShapeBuilderPreviewFaces } from '../getShapeBuilderPreviewFaces';

describe('getShapeBuilderPreviewFaces', () => {
  it('should return the touched faces from an in-progress drag when any exist, ignoring the hovered face', () => {
    // mock
    const touchedFaces = { n1: new Set(['k1', 'k2']) };
    const refs = createCanvasRefs({
      hover: { hoveredVectorShapeBuilderFaceRef: { current: { faceKey: 'other', nodeId: 'n2' } } },
      shapeBuilder: { touchedVectorShapeBuilderFacesRef: { current: touchedFaces } },
    });

    // action
    const result = getShapeBuilderPreviewFaces(refs);

    // result
    expect(result).toBe(touchedFaces);
  });

  it('should fall back to the single hovered face when no drag is in progress', () => {
    // mock
    const refs = createCanvasRefs({ hover: { hoveredVectorShapeBuilderFaceRef: { current: { faceKey: 'k1', nodeId: 'n1' } } } });

    // action
    const result = getShapeBuilderPreviewFaces(refs);

    // result
    expect(result).toEqual({ n1: new Set(['k1']) });
  });

  it('should return an empty object when there is neither a drag nor a hovered face', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    const result = getShapeBuilderPreviewFaces(refs);

    // result
    expect(result).toEqual({});
  });
});
