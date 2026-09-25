// types
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

// utils
import { getVectorMultiSelectRotateDelta } from '../getVectorMultiSelectRotateDelta';

vi.mock('utils/math/pointer/getPointerPosition', () => ({ getPointerPosition: (): unknown => ({ x: 0, y: 10 }) }));

describe('getVectorMultiSelectRotateDelta', () => {
  it('should measure how far the pointer turned around the pivot since the drag started', () => {
    // mock
    const dragState = { pivot: { x: 0, y: 0 }, startAngle: 30 } as TVectorMultiSelectRotateDragState;

    // result
    expect(getVectorMultiSelectRotateDelta({} as HTMLCanvasElement, {} as PointerEvent, { x: 0, y: 0, zoom: 1 }, dragState)).toBeCloseTo(
      60,
    );
  });
});
