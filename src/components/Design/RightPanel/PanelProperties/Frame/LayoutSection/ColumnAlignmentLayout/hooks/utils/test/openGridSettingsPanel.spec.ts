// store
import { setGridSettingsPanelOpen, updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { openGridSettingsPanel } from '../openGridSettingsPanel';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, setGridSettingsPanelOpen: vi.fn(actual.setGridSettingsPanelOpen), updateNode: vi.fn(actual.updateNode) };
});

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('openGridSettingsPanel', () => {
  it('should force an explicit row count and open the panel when rows were auto', () => {
    const dispatch = vi.fn();

    openGridSettingsPanel(dispatch, frame(), 3);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridRowCount: 3 }, id: 'frame-1' });
    expect(setGridSettingsPanelOpen).toHaveBeenCalledWith(true);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('should only open the panel when the row count is already explicit', () => {
    const dispatch = vi.fn();

    openGridSettingsPanel(dispatch, frame({ gridRowCount: 2 }), 2);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setGridSettingsPanelOpen(true));
  });

  it('should do nothing when no frame node is selected', () => {
    const dispatch = vi.fn();

    openGridSettingsPanel(dispatch, undefined, 1);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
