// store
import { RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { armVectorWidthLabelClick } from '../armVectorWidthLabelClick';

const getVectorWidthLabelAtPointMock = vi.fn();

vi.mock('components/Design/Canvas/utils/getVectorWidthLabelAtPoint', () => ({
  getVectorWidthLabelAtPoint: (...args: unknown[]): unknown => getVectorWidthLabelAtPointMock(...args),
}));

const state = { design: { activePageId: 'page-1', pages: { 'page-1': { nodes: { 'node-1': {} } } } } } as unknown as RootState;
const refs = {} as TCanvasRefs;
const viewport = { x: 0, y: 0, zoom: 2 };

describe('armVectorWidthLabelClick', () => {
  beforeEach(() => {
    getVectorWidthLabelAtPointMock.mockReset();
  });

  it('should return true when the point hits a visible width label', () => {
    // mock
    getVectorWidthLabelAtPointMock.mockReturnValue({ nodeId: 'node-1', segmentId: 's1', t: 0.5 });

    // result
    expect(armVectorWidthLabelClick(refs, { x: 10, y: 10 }, state, viewport)).toBe(true);
    expect(getVectorWidthLabelAtPointMock).toHaveBeenCalledWith({ x: 10, y: 10 }, { 'node-1': {} }, refs, 2);
  });

  it('should return undefined when the point hits no width label', () => {
    // mock
    getVectorWidthLabelAtPointMock.mockReturnValue(null);

    // result
    expect(armVectorWidthLabelClick(refs, { x: 10, y: 10 }, state, viewport)).toBeUndefined();
  });
});
