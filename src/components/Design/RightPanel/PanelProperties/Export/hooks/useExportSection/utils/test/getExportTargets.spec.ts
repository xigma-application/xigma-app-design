// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getExportTargets } from '../getExportTargets';

describe('getExportTargets', () => {
  it('should target every selected layer by id and name', () => {
    // mock
    const nodes = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ] as TSceneNode[];

    // result
    expect(getExportTargets(nodes, 'Page 1')).toEqual([
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ]);
  });

  it('should target the whole page when nothing is selected', () => {
    // result
    expect(getExportTargets([], 'Page 1')).toEqual([{ id: null, name: 'Page 1' }]);
  });

  it('should leave hidden slices out while keeping visible slices and hidden layers of other types', () => {
    // mock
    const nodes = [
      { hidden: true, id: 'hidden-slice', name: 'Hidden slice', type: NodeType.slice },
      { id: 'slice', name: 'Slice', type: NodeType.slice },
      { hidden: true, id: 'rectangle', name: 'Rectangle', type: NodeType.rectangle },
    ] as TSceneNode[];

    // result
    expect(getExportTargets(nodes, 'Page 1')).toEqual([
      { id: 'slice', name: 'Slice' },
      { id: 'rectangle', name: 'Rectangle' },
    ]);
  });

  it('should target nothing when only hidden slices are selected', () => {
    // mock
    const nodes = [{ hidden: true, id: 'slice', name: 'Slice', type: NodeType.slice }] as TSceneNode[];

    // result
    expect(getExportTargets(nodes, 'Page 1')).toEqual([]);
  });
});
