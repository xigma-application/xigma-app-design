// types
import { StrokeMode } from 'types/design/enums';

// utils
import { getVectorEffectLayers } from '../getVectorEffectLayers';
import { getVectorFillsChange } from 'utils/canvas/vectorNetwork/getVectorFillsChange';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];

describe('getVectorEffectLayers', () => {
  it('should take the outline of a plain stroke', () => {
    // before
    const layers = getVectorEffectLayers(makeSquareVector());

    // result
    expect(layers).toHaveLength(1);
    expect(layers[0].polygons.length).toBeGreaterThan(0);
  });

  it('should take the filled areas as even-odd layers before the stroke', () => {
    // mock
    const vector = makeSquareVector();
    const filled = { ...vector, ...getVectorFillsChange(vector, red) };

    // before
    const layers = getVectorEffectLayers(filled);

    // result
    expect(layers).toHaveLength(2);
    expect(layers[0].fillRule).toBe('evenOdd');
  });

  it('should take a mode stroke shape as it is drawn', () => {
    // result
    expect(getVectorEffectLayers(makeSquareVector({ strokeMode: StrokeMode.dynamic })).length).toBeGreaterThan(0);
  });

  it('should leave out a stroke without width or visible paints', () => {
    // result
    expect(getVectorEffectLayers(makeSquareVector({ strokeWidth: 0 }))).toEqual([]);
    expect(getVectorEffectLayers(makeSquareVector({ strokes: [{ ...red[0], visible: false }] }))).toEqual([]);
    expect(getVectorEffectLayers(makeSquareVector({ segments: {}, strokes: red, vertices: {} }))).toEqual([]);
  });
});
