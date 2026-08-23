// others
import { nanoid } from '@reduxjs/toolkit';

// types
import { TVectorNetworkComponent } from '../types';

export const buildClosingSegments = (closingPairKeys: Set<string>): Record<string, TVectorNetworkComponent['segments'][string]> => {
  const closingSegments: Record<string, TVectorNetworkComponent['segments'][string]> = {};

  closingPairKeys.forEach((pairKey) => {
    const [startId, endId] = pairKey.split('|');
    const closingSegmentId = nanoid();

    closingSegments[closingSegmentId] = { endId, id: closingSegmentId, startId, tangentEnd: null, tangentStart: null };
  });

  return closingSegments;
};
