// types
import { TPaint } from 'types/design/paint/types';

// utils
import { deriveVectorFaces } from '../deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from '../getVectorFillLoopKey';
import { getVectorFillsChange } from '../getVectorFillsChange';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const red: TPaint[] = [{ color: '#ff0000', opacity: 100, type: 'solid' }];
const image: TPaint[] = [{ opacity: 100, ref: 'blob:image', rotation: 0, scaleMode: 'fill', type: 'image' }];

describe('getVectorFillsChange', () => {
  it('should empty every area when the last fill is removed', () => {
    // mock
    const vector = makeSquareVector({ fillByKey: { a: red }, filledFaceKeys: ['a'], holeParentByKey: { b: 'a' } });

    // result
    expect(getVectorFillsChange(vector, [])).toEqual({ defaultFill: [], fillByKey: {}, filledFaceKeys: [], holeParentByKey: {} });
  });

  it('should fill every closed area of a vector that had none filled', () => {
    // mock
    const vector = makeSquareVector();
    const faceKey = getVectorFillLoopKey(deriveVectorFaces(vector)[0].pieceKeys);

    // result
    expect(getVectorFillsChange(vector, red)).toEqual({ defaultFill: red, fillByKey: { [faceKey]: red }, filledFaceKeys: [faceKey] });
  });

  it('should replace the fill of every filled area and keep the rest of the map', () => {
    // mock
    const vector = makeSquareVector({ fillByKey: { a: red, b: red, old: red }, filledFaceKeys: ['a', 'b'] });

    // result
    expect(getVectorFillsChange(vector, image)).toEqual({ defaultFill: image, fillByKey: { a: image, b: image, old: red } });
  });
});
