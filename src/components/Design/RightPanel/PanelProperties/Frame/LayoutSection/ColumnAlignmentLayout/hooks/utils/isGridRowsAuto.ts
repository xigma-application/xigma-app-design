// types
import { TFrameNode } from 'types/design/types';

export const isGridRowsAuto = (frames: TFrameNode[]): boolean => frames.every((frame) => frame.gridRowCount === undefined);
