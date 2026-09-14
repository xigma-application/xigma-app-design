// utils
import { makeSolidPaint } from '../makeSolidPaint';
import { paintGroupKey } from '../paintGroupKey';

// types
import { BlendMode } from 'types/design/enums';
import { TGradientPaint, TImagePaint, TPatternPaint } from 'types/design/paint/types';

describe('paintGroupKey', () => {
  it('should produce an identical key for two structurally equal solid stacks', () => {
    expect(paintGroupKey([makeSolidPaint('#abcdef', 50)])).toBe(paintGroupKey([makeSolidPaint('#abcdef', 50)]));
  });

  it('should distinguish stacks that differ only in opacity', () => {
    expect(paintGroupKey([makeSolidPaint('#abcdef', 50)])).not.toBe(paintGroupKey([makeSolidPaint('#abcdef', 60)]));
  });

  it('should distinguish a hidden paint from a visible one', () => {
    expect(paintGroupKey([{ ...makeSolidPaint('#000000'), visible: false }])).not.toBe(paintGroupKey([makeSolidPaint('#000000')]));
  });

  it('should key a multi-paint stack by every layer in order', () => {
    const key = paintGroupKey([makeSolidPaint('#111111'), makeSolidPaint('#222222', 30)]);

    expect(key).toContain('|');
    expect(key).not.toBe(paintGroupKey([makeSolidPaint('#222222', 30), makeSolidPaint('#111111')]));
  });

  it('should fold gradient geometry and stops into the key', () => {
    const gradient: TGradientPaint = {
      end: { x: 1, y: 1 },
      opacity: 100,
      start: { x: 0, y: 0 },
      stops: [
        { color: '#000000', opacity: 100, position: 0 },
        { color: '#ffffff', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    };

    expect(paintGroupKey([gradient])).toBe(paintGroupKey([gradient]));
    expect(paintGroupKey([gradient])).not.toBe(paintGroupKey([{ ...gradient, end: { x: 1, y: 0 } }]));
  });

  it('should key an image paint by ref and scale mode', () => {
    const image: TImagePaint = { opacity: 100, ref: 'asset-1', scaleMode: 'fill', type: 'image' };

    expect(paintGroupKey([image])).not.toBe(paintGroupKey([{ ...image, scaleMode: 'tile' }]));
  });

  it('should key a pattern paint without throwing, even though it has no gradient geometry', () => {
    const pattern: TPatternPaint = {
      alignmentIndex: 0,
      direction: 'horizontal',
      opacity: 100,
      scale: 100,
      spacingX: 0,
      spacingY: 0,
      tileType: 'rectangular',
      type: 'pattern',
    };

    expect(() => paintGroupKey([pattern])).not.toThrow();
    expect(paintGroupKey([pattern])).not.toBe(paintGroupKey([{ ...pattern, opacity: 50 }]));
  });

  it('should distinguish stacks that differ only in blend mode', () => {
    const solid = makeSolidPaint('#abcdef');

    expect(paintGroupKey([solid])).not.toBe(paintGroupKey([{ ...solid, blendMode: BlendMode.multiply }]));
  });
});
