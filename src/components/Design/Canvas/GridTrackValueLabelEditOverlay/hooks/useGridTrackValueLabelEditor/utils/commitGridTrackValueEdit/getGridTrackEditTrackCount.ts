// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { getDerivedGridRowCount } from 'store/design/utils/autoLayout/getDerivedGridRowCount';

export const getGridTrackEditTrackCount = (frame: TFrameNode, nodes: Record<string, TSceneNode>, axis: TGridTrackAxis): number =>
  axis === 'column'
    ? Math.max(Math.round(frame.gridColumnCount ?? 1), 1)
    : Math.max(Math.round(frame.gridRowCount ?? getDerivedGridRowCount(frame, nodes)), 1);
