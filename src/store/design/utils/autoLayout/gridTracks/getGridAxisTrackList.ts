// types
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';
import { TGridTrackAxis } from './types';

// utils
import { buildGridTrackList } from './buildGridTrackList';
import { getGridAxisTrackCount } from './getGridAxisTrackCount';

export const getGridAxisTrackList = (frame: TFrameNode, nodesById: Record<string, TSceneNode>, axis: TGridTrackAxis): TGridTrackSize[] => {
  const count = getGridAxisTrackCount(frame, nodesById, axis);
  const provided = axis === 'column' ? frame.gridColumnSizes : frame.gridRowSizes;

  return buildGridTrackList(count, provided);
};
