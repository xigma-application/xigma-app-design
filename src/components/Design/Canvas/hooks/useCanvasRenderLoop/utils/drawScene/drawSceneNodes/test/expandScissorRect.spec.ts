// types
import { TDrawSceneContext } from '../../types';

// utils
import { expandScissorRect } from '../expandScissorRect';

const context = { devicePixelHeight: 100, devicePixelWidth: 200 } as TDrawSceneContext;
const gl = {} as WebGL2RenderingContext;

describe('expandScissorRect', () => {
  it('should grow the rect by the amount on every side', () => {
    // result
    expect(expandScissorRect(context, gl, { height: 10, width: 10, x: 50, y: 50 }, 5)).toEqual({ height: 20, width: 20, x: 45, y: 45 });
  });

  it('should keep the grown rect inside the device pixels', () => {
    // result
    expect(expandScissorRect(context, gl, { height: 95, width: 195, x: 2, y: 2 }, 5)).toEqual({ height: 100, width: 200, x: 0, y: 0 });
  });
});
