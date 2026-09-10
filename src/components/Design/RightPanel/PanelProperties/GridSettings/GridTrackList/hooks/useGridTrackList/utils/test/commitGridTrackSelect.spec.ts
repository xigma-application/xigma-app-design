// hooks
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// utils
import { commitGridTrackSelect } from '../commitGridTrackSelect';

const coordinator = (overrides: Partial<TGridTrackSelectionCoordinator> = {}): TGridTrackSelectionCoordinator => ({
  isSuppressed: () => false,
  onSelectionChange: vi.fn(),
  ...overrides,
});

describe('commitGridTrackSelect', () => {
  it('should report the selection to the coordinator and forward the row selection', () => {
    const onSelectionChange = vi.fn();
    const selectRow = vi.fn();

    commitGridTrackSelect(coordinator({ onSelectionChange }), 'column', selectRow, 1, { meta: false, shift: false });

    expect(onSelectionChange).toHaveBeenCalledWith('column', true);
    expect(selectRow).toHaveBeenCalledWith(1, { meta: false, shift: false });
  });
});
