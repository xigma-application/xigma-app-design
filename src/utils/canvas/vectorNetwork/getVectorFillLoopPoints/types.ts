// types
import { TVectorSegment } from 'types/design/types';

export type TChainable = { endId: string; id: string; startId: string };

export type TResolvedPieceUnit = { endId: string; id: string; pieces: TVectorSegment[]; startId: string };
