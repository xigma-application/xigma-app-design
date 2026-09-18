// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { getCropPaintChanges } from '../getCropPaintChanges';
import { translateFillsCrop } from '../translateFillsCrop';

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const image: TPaint = {
  crop: { height: 10, rotation: 0, width: 10, x: 0, y: 0 },
  opacity: 100,
  ref: 'a',
  rotation: 0,
  scaleMode: 'fill',
  type: 'image',
};

const nodeWith = (fills: TPaint[], strokes?: TPaint[]): TAppearanceNode => ({ fills, strokes }) as unknown as TAppearanceNode;

describe('getCropPaintChanges', () => {
  it('should return nothing when no paint has a crop to transform', () => {
    // result
    expect(getCropPaintChanges(nodeWith([solid], [solid]), (paints) => translateFillsCrop(paints, 5, 5))).toEqual({});
  });

  it('should transform the crops of the fills and the strokes independently', () => {
    // action
    const changes = getCropPaintChanges(nodeWith([solid], [image]), (paints) => translateFillsCrop(paints, 5, 7));

    // result
    expect(changes.fills).toBeUndefined();
    expect(changes.strokes).toEqual([{ ...image, crop: { height: 10, rotation: 0, width: 10, x: 5, y: 7 } }]);
  });

  it('should transform the fills crop when the node has no strokes', () => {
    // action
    const changes = getCropPaintChanges(nodeWith([image]), (paints) => translateFillsCrop(paints, 1, 2));

    // result
    expect(changes.fills).toEqual([{ ...image, crop: { height: 10, rotation: 0, width: 10, x: 1, y: 2 } }]);
    expect(changes.strokes).toBeUndefined();
  });
});
