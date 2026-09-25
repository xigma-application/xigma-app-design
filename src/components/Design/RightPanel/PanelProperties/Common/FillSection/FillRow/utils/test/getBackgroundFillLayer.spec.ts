// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getBackgroundFillLayer } from '../getBackgroundFillLayer';

const withFills = (fills: TPaint[]): TSceneNode => ({ fills }) as unknown as TSceneNode;

describe('getBackgroundFillLayer', () => {
  it('should use the most opaque visible solid fill', () => {
    // mock
    const fills = [
      { color: '#111111', opacity: 40, type: 'solid' },
      { color: '#222222', opacity: 80, type: 'solid' },
      { color: '#333333', opacity: 80, type: 'solid' },
      { color: '#444444', opacity: 100, type: 'solid', visible: false },
      { color: '#555555', opacity: 0, type: 'solid' },
    ] as TPaint[];

    // result
    expect(getBackgroundFillLayer(withFills(fills))).toEqual({ alpha: 0.8, color: '#222222', kind: 'solid' });
  });

  it('should report a non-solid or blended fill as unsupported', () => {
    // result
    expect(getBackgroundFillLayer(withFills([{ opacity: 100, type: 'image' } as TPaint]))).toEqual({
      kind: 'unsupported',
      reason: 'imageBackground',
    });
    expect(
      getBackgroundFillLayer(withFills([{ blendMode: BlendMode.darken, color: '#000000', opacity: 100, type: 'solid' } as TPaint])),
    ).toEqual({
      kind: 'unsupported',
      reason: 'backgroundBlendMode',
    });
  });

  it('should return none without a visible fill or for a node without fills', () => {
    // result
    expect(getBackgroundFillLayer(withFills([]))).toEqual({ kind: 'none' });
    expect(getBackgroundFillLayer({ type: 'line' } as unknown as TSceneNode)).toEqual({ kind: 'none' });
  });
});
