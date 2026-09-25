// types
import { NodeType, StrokeAlign, StrokeSides } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getStrokePaddings } from '../getStrokePaddings';

const node = (extra: object): TSceneNode => ({ id: 'n', type: NodeType.rectangle, ...extra }) as TSceneNode;

describe('getStrokePaddings', () => {
  it('should pad by half the stroke on every side for a centered stroke color', () => {
    // result
    expect(getStrokePaddings(node({ strokeColor: '#000', strokeWidth: 4 }))).toEqual({ bottom: 2, left: 2, right: 2, top: 2 });
  });

  it('should pad by the whole side width for an outside stroke paint on custom sides', () => {
    // result
    expect(
      getStrokePaddings(
        node({
          strokeAlign: StrokeAlign.outside,
          strokeLeftWidth: 3,
          strokeSides: StrokeSides.custom,
          strokeWidth: 3,
          strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
        }),
      ),
    ).toEqual({ bottom: 0, left: 3, right: 0, top: 0 });
  });

  it('should not pad without a stroke, with an empty stroke list or with a zero width', () => {
    // result
    expect(getStrokePaddings(node({ strokeWidth: 4 }))).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });
    expect(getStrokePaddings(node({ strokeWidth: 4, strokes: [] }))).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });
    expect(getStrokePaddings(node({ strokes: undefined }))).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });
    expect(getStrokePaddings(node({ strokeColor: '#000', strokeWidth: 0 }))).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });
    expect(getStrokePaddings({ id: 'g', strokeColor: '#000', type: NodeType.group } as unknown as TSceneNode)).toEqual({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    });
  });

  it('should treat a node without a stroke align as centered', () => {
    // result
    expect(getStrokePaddings({ id: 'l', strokeColor: '#000', strokeWidth: 2, type: NodeType.line } as unknown as TSceneNode)).toEqual({
      bottom: 1,
      left: 1,
      right: 1,
      top: 1,
    });
  });
});
