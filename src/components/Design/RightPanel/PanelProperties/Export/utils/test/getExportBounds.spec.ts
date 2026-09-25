// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getExportBounds } from '../getExportBounds';

const pageBoundsMock = vi.fn();

vi.mock('utils/canvas/getPageExportBounds', () => ({ getPageExportBounds: (...args: unknown[]): unknown => pageBoundsMock(...args) }));
vi.mock('utils/canvas/getExportContentBounds', () => ({ getExportContentBounds: (): string => 'content' }));
vi.mock('components/Design/Canvas/utils/getRotatedNodeBounds', () => ({ getRotatedNodeBounds: (): string => 'full' }));

const EMPTY = { height: 0, width: 0, x: 0, y: 0 };

describe('getExportBounds', () => {
  it('should use the page bounds for a page export, or empty bounds for an empty page', () => {
    // mock
    pageBoundsMock.mockReturnValueOnce('page').mockReturnValueOnce(null);

    // result
    expect(getExportBounds(null, {}, ['a'])).toEqual({ contentBounds: 'page', fullBounds: 'page' });
    expect(getExportBounds(null, {}, [])).toEqual({ contentBounds: EMPTY, fullBounds: EMPTY });
  });

  it('should use the content bounds and the rotated node bounds for a layer export', () => {
    // result
    expect(getExportBounds('n', { n: {} as TSceneNode }, [])).toEqual({ contentBounds: 'content', fullBounds: 'full' });
    expect(getExportBounds('missing', {}, [])).toEqual({ contentBounds: 'content', fullBounds: EMPTY });
  });

  it('should use the slice rectangle as both bounds for a slice export', () => {
    // result
    expect(getExportBounds('s', { s: { type: NodeType.slice } as TSceneNode }, [])).toEqual({ contentBounds: 'full', fullBounds: 'full' });
  });
});
