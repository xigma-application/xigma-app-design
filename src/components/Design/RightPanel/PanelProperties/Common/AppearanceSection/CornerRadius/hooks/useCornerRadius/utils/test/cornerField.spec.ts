// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// utils
import { cornerField } from '../cornerField';

describe('cornerField', () => {
  it('should build a field carrying the given metadata and value', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;

    // action
    const field = cornerField(dispatch, 'n1', 'cornerRadiusTopLeft', 'Top left', 'e2e', 'BorderRadiusT', 'Top left tooltip', 4);

    // result
    expect(field).toMatchObject({
      ariaLabel: 'Top left',
      e2eValue: 'e2e',
      iconName: 'BorderRadiusT',
      tooltip: 'Top left tooltip',
      value: 4,
    });
  });

  it('should ignore a non-numeric typed commit', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const field = cornerField(dispatch, 'n1', 'cornerRadiusTopLeft', 'Top left', 'e2e', 'BorderRadiusT', 'tooltip', 4);

    // action
    field.onCommit('abc');

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should commit a valid typed value, clamped and rounded', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const field = cornerField(dispatch, 'n1', 'cornerRadiusTopLeft', 'Top left', 'e2e', 'BorderRadiusT', 'tooltip', 4);

    // action
    field.onCommit('12px');

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { cornerRadiusTopLeft: 12 }, id: 'n1' }));
  });

  it('should clamp a scrubbed negative value to zero', () => {
    // mock
    const dispatch = vi.fn() as unknown as AppDispatch;
    const field = cornerField(dispatch, 'n1', 'cornerRadiusTopLeft', 'Top left', 'e2e', 'BorderRadiusT', 'tooltip', 4);

    // action
    field.onScrub(-5);

    // result
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { cornerRadiusTopLeft: 0 }, id: 'n1' }));
  });
});
