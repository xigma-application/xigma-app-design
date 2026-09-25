// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { handleDoubleClick } from '../handleDoubleClick';

const editMock = vi.fn();

vi.mock('utils/math/pointer/getPointerPosition', () => ({ getPointerPosition: (): unknown => ({ x: 0, y: 0 }) }));
vi.mock('../getWidthLabelEditAtPoint', () => ({ getWidthLabelEditAtPoint: (...args: unknown[]): unknown => editMock(...args) }));

const event = (): MouseEvent & { preventDefault: TFunc; stopPropagation: TFunc } =>
  ({ preventDefault: vi.fn(), stopPropagation: vi.fn() }) as unknown as MouseEvent & { preventDefault: TFunc; stopPropagation: TFunc };

describe('handleDoubleClick', () => {
  it('should start editing a double-clicked width label and keep the event from the canvas', () => {
    // mock
    const setEdit = vi.fn();
    const clickEvent = event();
    editMock.mockReturnValue({ nodeId: 'v' });

    // before
    handleDoubleClick({} as HTMLCanvasElement, clickEvent, {} as TCanvasRefs, setEdit);

    // result
    expect(setEdit).toHaveBeenCalledWith({ nodeId: 'v' });
    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should leave other double clicks alone', () => {
    // mock
    const setEdit = vi.fn();
    const clickEvent = event();
    editMock.mockReturnValue(null);

    // before
    handleDoubleClick({} as HTMLCanvasElement, clickEvent, {} as TCanvasRefs, setEdit);

    // result
    expect(setEdit).not.toHaveBeenCalled();
    expect(clickEvent.preventDefault).not.toHaveBeenCalled();
  });
});
