// types
import { EffectType } from 'types/design/enums';
import { TEffect } from 'types/design/types';

// utils
import { getVectorSnapshotEffectLayers } from '../getVectorSnapshotEffectLayers';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getVectorSnapshotEffectLayers', () => {
  it('should keep the effect shape only for a vector with a shadow or noise', () => {
    // mock
    const effects = [{ type: EffectType.dropShadow } as TEffect];

    // result
    expect(getVectorSnapshotEffectLayers(makeSquareVector({ effects })).length).toBeGreaterThan(0);
    expect(getVectorSnapshotEffectLayers(makeSquareVector())).toEqual([]);
  });
});
