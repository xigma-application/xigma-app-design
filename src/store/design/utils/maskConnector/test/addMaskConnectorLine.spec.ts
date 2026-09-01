// types
import { TMaskConnectorLine } from 'store/design/types';

// utils
import { addMaskConnectorLine } from '../addMaskConnectorLine';

describe('addMaskConnectorLine', () => {
  it('should create a new entry for a node with no lines yet', () => {
    const infoById = new Map<string, TMaskConnectorLine[]>();
    addMaskConnectorLine(infoById, 'a', { depthOffset: 0, role: 'masked-start' });
    expect(infoById.get('a')).toEqual([{ depthOffset: 0, role: 'masked-start' }]);
  });

  it('should append to an existing entry instead of replacing it', () => {
    const infoById = new Map<string, TMaskConnectorLine[]>([['a', [{ depthOffset: 0, role: 'masked-start' }]]]);
    addMaskConnectorLine(infoById, 'a', { depthOffset: 1, role: 'masked-continue' });
    expect(infoById.get('a')).toEqual([
      { depthOffset: 0, role: 'masked-start' },
      { depthOffset: 1, role: 'masked-continue' },
    ]);
  });
});
