// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getNodePaints } from '../getNodePaints';

const fill: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const stroke: TPaint = { color: '#0000ff', opacity: 100, type: 'solid' };

describe('getNodePaints', () => {
  it('should return the fills by default', () => {
    expect(getNodePaints({ fills: [fill], strokes: [stroke] })).toEqual([fill]);
  });

  it('should return the strokes for the strokes property', () => {
    expect(getNodePaints({ fills: [fill], strokes: [stroke] }, 'strokes')).toEqual([stroke]);
  });

  it('should return an empty list when the node has no strokes yet', () => {
    expect(getNodePaints({ fills: [fill] }, 'strokes')).toEqual([]);
  });
});
