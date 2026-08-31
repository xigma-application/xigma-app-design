// types
import { TStrokeableNode } from 'utils/canvas/vectorNetwork/getNodeStrokeOutline/types';
import { TTextNode, TVectorNode } from 'types/design/types';

export type TShapeOutlineTarget = { node: TStrokeableNode; outline: TVectorNode };
export type TTextOutlineTarget = { node: TTextNode; outline: TVectorNode };
