// utils
import { getExternalSelectedIndices } from '../getExternalSelectedIndices';

describe('getExternalSelectedIndices', () => {
  it('should return the selection indices when the selection matches the frame and axis', () => {
    expect(getExternalSelectedIndices('column', 'frame-1', { axis: 'column', frameId: 'frame-1', indices: [2] })).toEqual([2]);
  });

  it('should return an empty array when the selection is for a different frame', () => {
    expect(getExternalSelectedIndices('column', 'frame-1', { axis: 'column', frameId: 'frame-2', indices: [2] })).toEqual([]);
  });

  it('should return an empty array when the selection is for a different axis', () => {
    expect(getExternalSelectedIndices('column', 'frame-1', { axis: 'row', frameId: 'frame-1', indices: [2] })).toEqual([]);
  });

  it('should return an empty array when there is no selection', () => {
    expect(getExternalSelectedIndices('column', 'frame-1', null)).toEqual([]);
  });
});
