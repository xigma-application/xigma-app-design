import { RefObject } from 'react';

// utils
import { recordGridTrackRevisionSelection } from '../recordGridTrackRevisionSelection';

const mapRef = (): RefObject<WeakMap<object, number[]>> => ({ current: new WeakMap<object, number[]>() });

describe('recordGridTrackRevisionSelection', () => {
  it('should record the selection under the given revision', () => {
    const revision = {};
    const byRevision = mapRef();

    recordGridTrackRevisionSelection(byRevision, revision, [1, 2]);

    expect(byRevision.current.get(revision)).toEqual([1, 2]);
  });

  it('should do nothing when the revision is not an object', () => {
    const byRevision = mapRef();

    expect(() => recordGridTrackRevisionSelection(byRevision, null, [1])).not.toThrow();
  });
});
