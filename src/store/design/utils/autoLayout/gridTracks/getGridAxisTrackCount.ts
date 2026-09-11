// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridTrackAxis } from './types';

// utils
import { getDerivedGridRowCount } from '../getDerivedGridRowCount';

export const getGridAxisTrackCount = (frame: TFrameNode, nodesById: Record<string, TSceneNode>, axis: TGridTrackAxis): number =>
  axis === 'column'
    ? Math.max(Math.round(frame.gridColumnCount ?? 1), 1)
    : Math.max(Math.round(frame.gridRowCount ?? getDerivedGridRowCount(frame, nodesById)), 1);
