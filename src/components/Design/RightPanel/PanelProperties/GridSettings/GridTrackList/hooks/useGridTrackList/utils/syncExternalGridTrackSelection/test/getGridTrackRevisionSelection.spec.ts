import { RefObject } from 'react';

// utils
import { getGridTrackRevisionSelection } from '../getGridTrackRevisionSelection';

const mapRef = (): RefObject<WeakMap<object, number[]>> => ({ current: new WeakMap<object, number[]>() });

describe('getGridTrackRevisionSelection', () => {
  it('should return the recorded selection for a known revision', () => {
    const revision = {};
    const byRevision = mapRef();

    byRevision.current.set(revision, [0, 1]);

    expect(getGridTrackRevisionSelection(byRevision, revision)).toEqual([0, 1]);
  });

  it('should return undefined for an unseen revision', () => {
    expect(getGridTrackRevisionSelection(mapRef(), {})).toBeUndefined();
  });

  it('should return undefined when the revision is not an object', () => {
    expect(getGridTrackRevisionSelection(mapRef(), null)).toBeUndefined();
  });
});
