// types
import { TGridTrackSize } from 'types/design/types';

// utils
import { DEFAULT_GRID_TRACK } from './buildGridTrackList';

export const addGridTrack = (tracks: TGridTrackSize[]): TGridTrackSize[] => [...tracks, { ...DEFAULT_GRID_TRACK }];
