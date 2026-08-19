import { createAction } from '@reduxjs/toolkit';

export const beginHistoryGesture = createAction('history/beginGesture');
export const endHistoryGesture = createAction('history/endGesture');

export const redo = createAction('history/redo');
export const undo = createAction('history/undo');
