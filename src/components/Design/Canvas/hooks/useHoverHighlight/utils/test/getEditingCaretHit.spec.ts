// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { getCurvedCaretIndexAtPoint } from 'utils/canvas/text/getCurvedCaretIndexAtPoint';
import { getEditingCaretHit } from '../getEditingCaretHit';
import { getStraightCaretIndexAtPoint } from 'utils/canvas/text/getStraightCaretIndexAtPoint';

vi.mock('utils/canvas/text/getCurvedCaretIndexAtPoint', () => ({ getCurvedCaretIndexAtPoint: vi.fn(() => ({ distance: 1, index: 1 })) }));
vi.mock('utils/canvas/text/getStraightCaretIndexAtPoint', () => ({
  getStraightCaretIndexAtPoint: vi.fn(() => ({ distance: 2, index: 2 })),
}));

const BOX: TEditingTextBox = { flipX: false, flipY: false, height: 100, rotation: 0, width: 300, x: 0, y: 0 };
const POINT = { x: 10, y: 20 };

describe('getEditingCaretHit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when nothing is being edited', () => {
    // result
    expect(getEditingCaretHit(null, 'Hi', POINT)).toBeNull();
  });

  it('should delegate to getStraightCaretIndexAtPoint when the box has no pathId', () => {
    // result
    expect(getEditingCaretHit(BOX, 'Hi', POINT)).toEqual({ distance: 2, index: 2 });
    expect(getStraightCaretIndexAtPoint).toHaveBeenCalledWith(expect.anything(), 'Hi', expect.anything(), BOX, POINT);
    expect(getCurvedCaretIndexAtPoint).not.toHaveBeenCalled();
  });

  it('should delegate to getCurvedCaretIndexAtPoint when the box has a pathId', () => {
    // mock
    const curvedBox: TEditingTextBox = { ...BOX, pathId: 'ellipse-1' };

    // result
    expect(getEditingCaretHit(curvedBox, 'Hi', POINT)).toEqual({ distance: 1, index: 1 });
    expect(getCurvedCaretIndexAtPoint).toHaveBeenCalledWith(expect.anything(), 'Hi', expect.anything(), curvedBox, POINT, undefined);
    expect(getStraightCaretIndexAtPoint).not.toHaveBeenCalled();
  });

  it('should forward a resolved path node through to getCurvedCaretIndexAtPoint', () => {
    // mock
    const curvedBox: TEditingTextBox = { ...BOX, pathId: 'vector-1' };
    const pathNode = { id: 'vector-1' } as never;

    // before
    getEditingCaretHit(curvedBox, 'Hi', POINT, pathNode);

    // result
    expect(getCurvedCaretIndexAtPoint).toHaveBeenCalledWith(expect.anything(), 'Hi', expect.anything(), curvedBox, POINT, pathNode);
  });
});
