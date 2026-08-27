// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TErasedNetwork } from './types';

// utils
import { eraseVectorNetworkAlongCapsule } from './eraseVectorNetworkAlongCapsule';

export const eraseVectorNetworkAlongPath = (node: TVectorNode, path: TPoint[], radius: number): TErasedNetwork | null => {
  const starts = path.length > 1 ? path.slice(0, -1) : path;

  let current = node;
  let changed = false;

  starts.forEach((start, index) => {
    const result = eraseVectorNetworkAlongCapsule(current, start, path[index + 1] ?? start, radius);

    if (result) {
      current = { ...current, segments: result.segments, vertices: result.vertices };
      changed = true;
    }
  });

  return changed ? { segments: current.segments, vertices: current.vertices } : null;
};
