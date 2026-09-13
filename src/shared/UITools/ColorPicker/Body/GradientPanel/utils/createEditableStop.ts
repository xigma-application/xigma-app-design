import { nanoid } from '@reduxjs/toolkit';

// types
import { TEditableGradientStop } from '../types';

export const createEditableStop = (position: number, color: string, opacity: number): TEditableGradientStop => ({
  color,
  id: nanoid(),
  opacity,
  position,
});
