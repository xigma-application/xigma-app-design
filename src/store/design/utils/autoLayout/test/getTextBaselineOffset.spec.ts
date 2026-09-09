// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// utils
import { getTextBaselineOffset } from '../getTextBaselineOffset';

describe('getTextBaselineOffset', () => {
  it('should scale the atlas base metric by the ratio of fontSize to the atlas size', () => {
    const scale = 16 / MSDF_ATLAS_JSON.info.size;

    expect(getTextBaselineOffset(16)).toBe(MSDF_ATLAS_JSON.common.base * scale);
  });

  it('should scale linearly with fontSize', () => {
    expect(getTextBaselineOffset(32)).toBe(getTextBaselineOffset(16) * 2);
  });

  it('should return zero for a zero fontSize', () => {
    expect(getTextBaselineOffset(0)).toBe(0);
  });
});
