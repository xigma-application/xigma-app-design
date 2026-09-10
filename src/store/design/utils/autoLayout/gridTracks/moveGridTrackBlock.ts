// types
import { TGridTrackSize } from 'types/design/types';

export type TMoveGridTrackBlockResult = {
  newIndexByOld: number[];
  tracks: TGridTrackSize[];
};

const toRestTarget = (insertionSlot: number, sourceStart: number, sourceCount: number): number => {
  switch (true) {
    case insertionSlot <= sourceStart:
      return insertionSlot;
    case insertionSlot >= sourceStart + sourceCount:
      return insertionSlot - sourceCount;
    default:
      return sourceStart;
  }
};

export const moveGridTrackBlock = (
  tracks: TGridTrackSize[],
  sourceStart: number,
  sourceCount: number,
  insertionSlot: number,
): TMoveGridTrackBlockResult => {
  const block = tracks.slice(sourceStart, sourceStart + sourceCount);
  const rest = [...tracks.slice(0, sourceStart), ...tracks.slice(sourceStart + sourceCount)];
  const restTarget = Math.min(Math.max(toRestTarget(insertionSlot, sourceStart, sourceCount), 0), rest.length);
  const nextTracks = [...rest.slice(0, restTarget), ...block, ...rest.slice(restTarget)];
  const newIndexByOld = new Array<number>(tracks.length);

  for (let offset = 0; offset < sourceCount; offset += 1) {
    newIndexByOld[sourceStart + offset] = restTarget + offset;
  }

  rest.forEach((_track, restIndex) => {
    const oldIndex = restIndex < sourceStart ? restIndex : restIndex + sourceCount;
    const newIndex = restIndex < restTarget ? restIndex : restIndex + sourceCount;

    newIndexByOld[oldIndex] = newIndex;
  });

  return { newIndexByOld, tracks: nextTracks };
};
