// utils
import { getRoundedVectorFillData } from '../getRoundedVectorFillData';
import { getVectorFillsChange } from 'utils/canvas/vectorNetwork/getVectorFillsChange';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';
import { roundVectorNetworkCorners } from '../roundVectorNetworkCorners';

const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];

describe('getRoundedVectorFillData', () => {
  it('should move the fill of an area onto the same area with its corners rounded', () => {
    // mock
    const square = makeSquareVector();
    const filled = { ...square, ...getVectorFillsChange(square, red) };
    const [key] = filled.filledFaceKeys;
    const network = roundVectorNetworkCorners({ ...filled, cornerRadius: 10 })!;

    // before
    const data = getRoundedVectorFillData({ ...filled, holeParentByKey: { [key]: key, gone: key, other: 'gone' } }, network);

    // result
    expect(data.filledFaceKeys).toHaveLength(1);
    expect(data.filledFaceKeys[0]).not.toBe(key);
    expect(data.fillByKey).toEqual({ [data.filledFaceKeys[0]]: red });
    expect(data.holeParentByKey).toEqual({ [data.filledFaceKeys[0]]: data.filledFaceKeys[0] });
  });

  it('should drop a hole whose outer area is gone', () => {
    // mock
    const square = makeSquareVector();
    const filled = { ...square, ...getVectorFillsChange(square, red) };
    const [key] = filled.filledFaceKeys;

    // result
    expect(
      getRoundedVectorFillData({ ...filled, holeParentByKey: { [key]: 'gone' } }, roundVectorNetworkCorners({ ...filled, cornerRadius: 10 })!).holeParentByKey,
    ).toEqual({});
  });

  it('should skip the areas of a vector without fills', () => {
    // mock
    const square = makeSquareVector();

    // result
    expect(getRoundedVectorFillData(square, roundVectorNetworkCorners({ ...square, cornerRadius: 10 })!)).toEqual({
      fillByKey: {},
      filledFaceKeys: [],
      holeParentByKey: {},
    });
  });

  it('should drop the fill of an area that no longer exists', () => {
    // mock
    const square = makeSquareVector({ fillByKey: { gone: red }, filledFaceKeys: ['gone'] });

    // result
    expect(getRoundedVectorFillData(square, roundVectorNetworkCorners({ ...square, cornerRadius: 10 })!).filledFaceKeys).toEqual([]);
  });
});
