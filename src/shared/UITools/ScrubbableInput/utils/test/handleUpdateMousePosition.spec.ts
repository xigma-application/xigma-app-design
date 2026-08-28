// utils
import { handleUpdateMousePosition } from '../handleUpdateMousePosition';

const setMousePosition = vi.fn();

describe('handleUpdateMousePosition', () => {
  beforeAll(() => {
    // mock
    window.innerHeight = 1000;
    window.innerWidth = 1000;
  });

  it('should shift the position by the horizontal movement', () => {
    // action
    handleUpdateMousePosition({ movementX: 1 } as MouseEvent, { x: 0, y: 0 }, setMousePosition);

    // result
    expect(setMousePosition).toHaveBeenCalledWith({ x: 1, y: 0 });
  });

  it('should wrap to the right edge when the position goes below zero', () => {
    // action
    handleUpdateMousePosition({ movementX: 1 } as MouseEvent, { x: -100, y: 0 }, setMousePosition);

    // result
    expect(setMousePosition).toHaveBeenCalledWith({ x: 1000, y: 0 });
  });

  it('should wrap to the left edge when the position goes past the width', () => {
    // action
    handleUpdateMousePosition({ movementX: 1 } as MouseEvent, { x: 1001, y: 0 }, setMousePosition);

    // result
    expect(setMousePosition).toHaveBeenCalledWith({ x: 0, y: 0 });
  });
});
