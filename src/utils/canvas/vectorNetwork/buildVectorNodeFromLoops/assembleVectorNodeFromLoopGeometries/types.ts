// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export type TVectorNodeLoopsBase = { id: string; name: string; parentId: string | null; rotation: number };

export type TLoopGeometry = { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> };
