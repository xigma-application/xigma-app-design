// utils
import { handleStrokeDashesScrub } from '../handleStrokeDashesScrub';

describe('handleStrokeDashesScrub', () => {
  it('should shift every length of the list by the same amount as the first one moved', () => {
    // mock
    const update = vi.fn();

    // action
    handleStrokeDashesScrub(30, [20, 40, 60, 80], update);

    // result
    expect(update).toHaveBeenCalledWith({ strokeDashes: [30, 50, 70, 90] });
  });

  it('should keep the lengths from going below zero', () => {
    // mock
    const update = vi.fn();

    // action
    handleStrokeDashesScrub(5, [20, 10, 40], update);

    // result
    expect(update).toHaveBeenCalledWith({ strokeDashes: [5, 0, 25] });
  });

  it('should not write a list in which nothing is drawn', () => {
    // mock
    const update = vi.fn();

    // action
    handleStrokeDashesScrub(0, [20], update);

    // result
    expect(update).not.toHaveBeenCalled();
  });
});
