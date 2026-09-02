// utils
import { getAxisEdges } from '../getAxisEdges';
import { getEdges } from '../../../../getDistanceGuides/getEdges';
import { pickNextChainLink } from '../pickNextChainLink';

const ACTIVE = getEdges({ height: 100, width: 200, x: 0, y: 300 });
const METRICS = getAxisEdges(ACTIVE, 'vertical');

describe('pickNextChainLink', () => {
  it('should pick the nearest unused same-size centred candidate above the cursor', () => {
    // mock
    const near = { bounds: { height: 100, width: 200, x: 0, y: 150 } };
    const far = { bounds: { height: 100, width: 200, x: 0, y: 0 } };

    // action
    const link = pickNextChainLink(ACTIVE, METRICS, [near, far], new Set(), 'vertical', -1, 0.5, 4);

    // result
    expect(link?.candidate).toBe(near);
    expect(link?.edges).toEqual(getEdges(near.bounds));
  });

  it('should return null when every candidate is used', () => {
    // mock
    const above = { bounds: { height: 100, width: 200, x: 0, y: 150 } };

    // action
    const link = pickNextChainLink(ACTIVE, METRICS, [above], new Set([above]), 'vertical', -1, 0.5, 4);

    // result
    expect(link).toBeNull();
  });

  it('should return null for a differently sized or off-centre candidate', () => {
    // mock
    const wrongSize = { bounds: { height: 100, width: 260, x: 0, y: 150 } };
    const offCentre = { bounds: { height: 100, width: 200, x: 40, y: 150 } };

    // action + result
    expect(pickNextChainLink(ACTIVE, METRICS, [wrongSize, offCentre], new Set(), 'vertical', -1, 0.5, 4)).toBeNull();
  });

  it('should ignore a candidate that is not on the walk side', () => {
    // mock — below the cursor while walking up
    const below = { bounds: { height: 100, width: 200, x: 0, y: 450 } };

    // action + result
    expect(pickNextChainLink(ACTIVE, METRICS, [below], new Set(), 'vertical', -1, 0.5, 4)).toBeNull();
  });

  it('should walk the other direction with sign +1', () => {
    // mock
    const below = { bounds: { height: 100, width: 200, x: 0, y: 450 } };

    // action
    const link = pickNextChainLink(ACTIVE, METRICS, [below], new Set(), 'vertical', 1, 0.5, 4);

    // result
    expect(link?.candidate).toBe(below);
  });
});
