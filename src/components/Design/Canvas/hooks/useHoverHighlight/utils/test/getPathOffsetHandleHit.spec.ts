// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { getPathOffsetHandleHit } from '../getPathOffsetHandleHit';
import { getPathTextOffsetHandleAtPoint } from '../../../../utils/getPathTextOffsetHandleAtPoint';
import { isPointOnPathTextHandle } from '../../../../utils/isPointOnPathTextHandle';

vi.mock('../../../../utils/getPathTextOffsetHandleAtPoint', () => ({ getPathTextOffsetHandleAtPoint: vi.fn(() => null) }));
vi.mock('../../../../utils/isPointOnPathTextHandle', () => ({ isPointOnPathTextHandle: vi.fn(() => true) }));

const POINT = { x: 10, y: 20 };
const VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOX: TEditingTextBox = { flipX: false, flipY: false, height: 100, pathId: 'ellipse-1', rotation: 0, width: 300, x: 0, y: 0 };

describe('getPathOffsetHandleHit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should check the editing node's own handle and use editingNodeId when a text box is being edited", () => {
    // mock
    vi.mocked(isPointOnPathTextHandle).mockReturnValue(true);

    // result
    expect(getPathOffsetHandleHit(POINT, BOX, 'editing-id', [], VIEWPORT)).toEqual({ hit: true, nodeId: 'editing-id' });
    expect(getPathTextOffsetHandleAtPoint).not.toHaveBeenCalled();
  });

  it('should report no hit when the pointer misses the editing handle', () => {
    // mock
    vi.mocked(isPointOnPathTextHandle).mockReturnValue(false);

    // result
    expect(getPathOffsetHandleHit(POINT, BOX, 'editing-id', [], VIEWPORT)).toEqual({ hit: false, nodeId: 'editing-id' });
  });

  it('should fall back to hit-testing every selected node when nothing is being edited', () => {
    // mock
    vi.mocked(getPathTextOffsetHandleAtPoint).mockReturnValue({ nodeId: 'node-a' });

    // result
    expect(getPathOffsetHandleHit(POINT, null, null, [], VIEWPORT)).toEqual({ hit: true, nodeId: 'node-a' });
    expect(isPointOnPathTextHandle).not.toHaveBeenCalled();
  });

  it('should report no hit and a null nodeId when nothing is being edited and no node is hit', () => {
    // mock
    vi.mocked(getPathTextOffsetHandleAtPoint).mockReturnValue(null);

    // result
    expect(getPathOffsetHandleHit(POINT, null, null, [], VIEWPORT)).toEqual({ hit: false, nodeId: null });
  });
});
