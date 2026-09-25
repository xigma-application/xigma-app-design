// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { canHoldSection } from '../canHoldSection';

const nodes = { frame: { type: NodeType.frame }, section: { type: NodeType.section } } as unknown as Record<string, TSceneNode>;

describe('canHoldSection', () => {
  it('should allow the page and a section as the parent', () => {
    // action / result
    expect(canHoldSection(null, nodes)).toBe(true);
    expect(canHoldSection('section', nodes)).toBe(true);
  });

  it('should not allow a frame or a missing parent', () => {
    // action / result
    expect(canHoldSection('frame', nodes)).toBe(false);
    expect(canHoldSection('missing', nodes)).toBe(false);
  });
});
