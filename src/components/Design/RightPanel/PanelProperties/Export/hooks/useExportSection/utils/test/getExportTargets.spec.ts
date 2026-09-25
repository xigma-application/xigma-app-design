// types
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
});
