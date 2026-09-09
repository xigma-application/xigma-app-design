// types
import { AutoSpacing } from 'types/design/enums';

// utils
import { getAutoLayoutWrappedLinePositions } from '../getAutoLayoutWrappedLinePositions';
import { getTextBaselineOffset } from '../../getTextBaselineOffset';

const frame = { height: 100, width: 200, x: 100, y: 200 };
const line = [
  { height: 20, id: 'a', width: 30 },
  { height: 20, id: 'b', width: 50 },
];

describe('getAutoLayoutWrappedLinePositions', () => {
  it('should stack a horizontal line’s children from the given counter offset, packed at the primary start', () => {
    const positions = getAutoLayoutWrappedLinePositions(
      line,
      true,
      frame,
      'start',
      'start',
      200,
      false,
      10,
      AutoSpacing.between,
      false,
      20,
      5,
    );

    expect(positions).toEqual([
      { height: 20, id: 'a', width: 30, x: 100, y: 205 },
      { height: 20, id: 'b', width: 50, x: 140, y: 205 },
    ]);
  });

  it('should stack a vertical line’s children, applying the counter offset to x instead of y', () => {
    const verticalLine = [
      { height: 30, id: 'a', width: 20 },
      { height: 50, id: 'b', width: 20 },
    ];

    const positions = getAutoLayoutWrappedLinePositions(
      verticalLine,
      false,
      frame,
      'start',
      'start',
      200,
      false,
      10,
      AutoSpacing.between,
      false,
      20,
      5,
    );

    expect(positions).toEqual([
      { height: 30, id: 'a', width: 20, x: 105, y: 200 },
      { height: 50, id: 'b', width: 20, x: 105, y: 240 },
    ]);
  });

  it('should distribute the primary gap evenly within the line when the primary gap is auto', () => {
    const positions = getAutoLayoutWrappedLinePositions(
      line,
      true,
      frame,
      'start',
      'start',
      200,
      true,
      0,
      AutoSpacing.between,
      false,
      20,
      0,
    );

    // gap = (200 - 30 - 50) / (2 - 1) = 120
    expect(positions).toEqual([
      { height: 20, id: 'a', width: 30, x: 100, y: 200 },
      { height: 20, id: 'b', width: 50, x: 250, y: 200 },
    ]);
  });

  it('should align the line’s children by text baseline instead of the normal counter alignment, when enabled', () => {
    const baselineLine = [
      { fontSize: 16, height: 20, id: 'text', width: 50 },
      { height: 30, id: 'icon', width: 24 },
    ];

    const positions = getAutoLayoutWrappedLinePositions(
      baselineLine,
      true,
      frame,
      'start',
      'start',
      200,
      false,
      0,
      AutoSpacing.between,
      true,
      30,
      0,
    );

    // both baselines land on the icon's own baseline (its bottom edge, the taller offset)
    const textBaselineOffset = getTextBaselineOffset(16);

    expect(positions).toEqual([
      { height: 20, id: 'text', width: 50, x: 100, y: 200 + 30 - textBaselineOffset },
      { height: 30, id: 'icon', width: 24, x: 150, y: 200 },
    ]);
  });
});
