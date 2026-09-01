// types
import { TMaskConnectorLine } from 'store/design/types';

// utils
import { getMaskConnectorPassthroughForChildren } from '../getMaskConnectorPassthroughForChildren';

describe('getMaskConnectorPassthroughForChildren', () => {
  it('should return an empty array when nothing is open', () => {
    expect(getMaskConnectorPassthroughForChildren([])).toEqual([]);
  });

  it('should shift every open line one level deeper and normalize it to "masked-continue"', () => {
    const passthrough: TMaskConnectorLine[] = [{ depthOffset: 0, role: 'masked-start' }];
    expect(getMaskConnectorPassthroughForChildren(passthrough)).toEqual([{ depthOffset: 1, role: 'masked-continue' }]);
  });

  it('should drop a "mask" line instead of propagating it into the mask node\'s own subtree', () => {
    const passthrough: TMaskConnectorLine[] = [{ depthOffset: 0, role: 'mask' }];
    expect(getMaskConnectorPassthroughForChildren(passthrough)).toEqual([]);
  });
});
