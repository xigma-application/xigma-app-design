// types
import { TOpenPropertyPanel } from 'store/design/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getOpenProgressiveBlur } from '../getOpenProgressiveBlur';

vi.mock('utils/design/effects/isProgressiveBlur', () => ({
  isProgressiveBlur: (effect: { progressive?: boolean }): boolean => Boolean(effect?.progressive),
}));

const progressive = { progressive: true };
const node = { effects: [{}, progressive, { progressive: true, visible: false }], id: 'n' } as unknown as TSceneNode;
const panel = (index: number, property = 'effects', nodeId = 'n'): TOpenPropertyPanel =>
  ({ index, nodeId, property }) as TOpenPropertyPanel;

describe('getOpenProgressiveBlur', () => {
  it('should return the visible progressive blur whose effect panel is open', () => {
    // result
    expect(getOpenProgressiveBlur([node], panel(1))).toEqual({ effect: progressive, effectIndex: 1, node });
  });

  it('should return nothing for a plain or hidden effect, another panel, node or selection', () => {
    // result
    expect(getOpenProgressiveBlur([node], panel(0))).toBeNull();
    expect(getOpenProgressiveBlur([node], panel(2))).toBeNull();
    expect(getOpenProgressiveBlur([node], panel(1, 'fills'))).toBeNull();
    expect(getOpenProgressiveBlur([node], panel(1, 'effects', 'other'))).toBeNull();
    expect(getOpenProgressiveBlur([node, node], panel(1))).toBeNull();
    expect(getOpenProgressiveBlur([node], null)).toBeNull();
  });

  it('should return nothing for a node without effects', () => {
    // result
    expect(getOpenProgressiveBlur([{ id: 'n' } as TSceneNode], panel(0))).toBeNull();
    expect(getOpenProgressiveBlur([{ effects: undefined, id: 'n' } as unknown as TSceneNode], panel(0))).toBeNull();
  });
});
