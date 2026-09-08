// others
import { AUTO_LAYOUT_HANDLE_SHIFT_SNAP_STEP_PX } from 'constant/canvas';

export const getAutoLayoutHandleSnappedValue = (value: number, isShiftPressed: boolean): number =>
  isShiftPressed ? Math.round(value / AUTO_LAYOUT_HANDLE_SHIFT_SNAP_STEP_PX) * AUTO_LAYOUT_HANDLE_SHIFT_SNAP_STEP_PX : Math.round(value);
