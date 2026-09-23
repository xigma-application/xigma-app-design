// utils
import { canSelectMatchingLayers } from '../canSelectMatchingLayers';
import { matchingNodesById } from './matchingLayersFixtures';

describe('canSelectMatchingLayers', () => {
  it('should be true when every selected node is nested in a top-level frame', () => {
    // result
    expect(canSelectMatchingLayers(['titleA', 'cardB1'], matchingNodesById)).toBe(true);
  });

  it('should be false for an empty selection', () => {
    // result
    expect(canSelectMatchingLayers([], matchingNodesById)).toBe(false);
  });

  it('should be false when any selected node is top-level', () => {
    // result
    expect(canSelectMatchingLayers(['titleA', 'screenB'], matchingNodesById)).toBe(false);
    expect(canSelectMatchingLayers(['screenD'], matchingNodesById)).toBe(false);
  });

  it('should be false when a selected id is missing', () => {
    // result
    expect(canSelectMatchingLayers(['missing'], matchingNodesById)).toBe(false);
  });
});
