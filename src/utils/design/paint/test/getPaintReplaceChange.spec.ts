// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getPaintReplaceChange } from '../getPaintReplaceChange';

const red: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const blue: TPaint = { color: '#0000ff', opacity: 100, type: 'solid' };
const green: TPaint = { color: '#00ff00', opacity: 100, type: 'solid' };

describe('getPaintReplaceChange', () => {
  it('should replace the paint at the index in the fills by default', () => {
    // result
    expect(getPaintReplaceChange({ fills: [red, blue] }, undefined, 1, green)).toEqual({ fills: [red, green] });
  });

  it('should replace the paint at the index in the strokes for the strokes property', () => {
    // result
    expect(getPaintReplaceChange({ fills: [red], strokes: [blue, red] }, 'strokes', 0, green)).toEqual({ strokes: [green, red] });
  });
});
