// types
import { TPaint, TSolidPaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { blendHexColors } from 'utils/color/blendHexColors';
import { resolveContrastBackground } from '../resolveContrastBackground';

const PAGE: TSolidPaint = { color: '#ffffff', opacity: 100, type: 'solid' };

const withFills = (fills: TPaint[]): TSceneNode => ({ fills }) as unknown as TSceneNode;

const solid = (color: string, opacity = 100): TPaint => ({ color, opacity, type: 'solid' }) as TPaint;

describe('resolveContrastBackground', () => {
  it('should use the nearest opaque ancestor fill', () => {
    // result
    expect(resolveContrastBackground([withFills([]), withFills([solid('#123456')])], PAGE)).toEqual({ color: '#123456' });
  });

  it('should blend a translucent fill over what lies beneath it', () => {
    // before
    const result = resolveContrastBackground([withFills([solid('#000000', 50)])], PAGE);

    // result
    expect(result).toEqual({ color: blendHexColors('#000000', '#ffffff', 0.5) });
  });

  it('should pass an unsupported reason through, even from beneath a translucent fill', () => {
    // mock
    const image = withFills([{ opacity: 100, type: 'image' } as TPaint]);

    // result
    expect(resolveContrastBackground([image], PAGE)).toEqual({ reason: 'imageBackground' });
    expect(resolveContrastBackground([withFills([solid('#000000', 50)]), image], PAGE)).toEqual({ reason: 'imageBackground' });
  });

  it('should fall back to the page background, or a mixed reason for a hidden one', () => {
    // result
    expect(resolveContrastBackground([], PAGE)).toEqual({ color: '#ffffff' });
    expect(resolveContrastBackground([], { ...PAGE, visible: false })).toEqual({ reason: 'mixedBackground' });
    expect(resolveContrastBackground([], { ...PAGE, opacity: 0 })).toEqual({ reason: 'mixedBackground' });
  });
});
