// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

type TPathAccumulator = {
  d: string;
  previousEndId: string | null;
};

export const buildVectorNetworkPathD = (vertices: Record<string, TVectorVertex>, segments: Record<string, TVectorSegment>): string => {
  const { d } = Object.values(segments).reduce<TPathAccumulator>(
    (accumulator, segment) => {
      const start = vertices[segment.startId];
      const end = vertices[segment.endId];
      const moveTo = segment.startId === accumulator.previousEndId ? '' : `M${start.x} ${start.y} `;
      const drawTo =
        segment.tangentStart && segment.tangentEnd
          ? `C${start.x + segment.tangentStart.x} ${start.y + segment.tangentStart.y} ${end.x + segment.tangentEnd.x} ${end.y + segment.tangentEnd.y} ${end.x} ${end.y}`
          : `L${end.x} ${end.y}`;

      return { d: `${accumulator.d}${moveTo}${drawTo} `, previousEndId: segment.endId };
    },
    { d: '', previousEndId: null },
  );

  return d.trim();
};
