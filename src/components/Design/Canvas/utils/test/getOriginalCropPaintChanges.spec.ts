// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { getOriginalCropPaintChanges } from '../getOriginalCropPaintChanges';
import { translateFillsCrop } from '../translateFillsCrop';

const image = (x: number): TPaint => ({
  crop: { height: 10, rotation: 0, width: 10, x, y: 0 },
  opacity: 100,
  ref: 'a',
  rotation: 0,
  scaleMode: 'fill',
  type: 'image',
});

const nodeWith = (fills: TPaint[], strokes?: TPaint[]): TAppearanceNode => ({ fills, id: 'n', strokes }) as unknown as TAppearanceNode;

describe('getOriginalCropPaintChanges', () => {
  it('should transform the originals of fills and strokes read through their own cache keys', () => {
    // mock
    const getOriginal = vi.fn((_key: string, current: TPaint[]) => current);

    // action
    const changes = getOriginalCropPaintChanges(nodeWith([image(0)], [image(100)]), getOriginal, null, (paints, skip) =>
      translateFillsCrop(paints, 5, 0, skip),
    );

    // result
    expect(getOriginal).toHaveBeenCalledWith('n', [image(0)]);
    expect(getOriginal).toHaveBeenCalledWith('n:strokes', [image(100)]);
    expect(changes.fills).toEqual([image(5)]);
    expect(changes.strokes).toEqual([image(105)]);
  });

  it('should skip only the paint being edited in the matching property', () => {
    // action
    const changes = getOriginalCropPaintChanges(
      nodeWith([image(0)], [image(100)]),
      (_key, current) => current,
      { mode: 'crop', nodeId: 'n', paintIndex: 0, property: 'strokes' },
      (paints, skip) => translateFillsCrop(paints, 5, 0, skip),
    );

    // result
    expect(changes.fills).toEqual([image(5)]);
    expect(changes.strokes).toBeUndefined();
  });

  it('should return nothing when no paint has a crop', () => {
    // result
    expect(
      getOriginalCropPaintChanges(
        nodeWith([]),
        (_key, current) => current,
        null,
        (paints, skip) => translateFillsCrop(paints, 1, 1, skip),
      ),
    ).toEqual({});
  });
});
