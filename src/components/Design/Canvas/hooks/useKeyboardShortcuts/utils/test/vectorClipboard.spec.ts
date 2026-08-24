// types
import { TVectorFragment } from '../../types';

// utils
import { getVectorClipboardFragment, setVectorClipboardFragment } from '../vectorClipboard';

describe('vectorClipboard', () => {
  it('should return null before anything was ever copied', () => {
    // result
    expect(getVectorClipboardFragment()).toBeNull();
  });

  it('should return a snapshot of whatever was last set, independent of later mutation of the source object', () => {
    // mock
    const fragment: TVectorFragment = {
      filledFacePieceKeySets: [],
      segments: [],
      vertexHandleModes: {},
      vertices: [{ id: 'v1', x: 0, y: 0 }],
    };

    // action
    setVectorClipboardFragment(fragment);
    fragment.vertices[0].x = 999;

    // result
    expect(getVectorClipboardFragment()).toEqual({
      filledFacePieceKeySets: [],
      segments: [],
      vertexHandleModes: {},
      vertices: [{ id: 'v1', x: 0, y: 0 }],
    });
  });
});
