// types
import { TDraftRect } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

export type TVectorPointGroup = { nodeId: string; rect: TDraftRect; vertexIds: string[] };

export type TSelectedVectorPointsEntry = { handles: TVectorHandleHover[]; node: TVectorNode; pointIds: string[]; vertexIds: string[] };
