// types
import { TLineNetworkCrossing, TVectorNetworkComponent } from 'utils/canvas/vectorNetwork/cutVectorNetwork/types';
import { TPaint } from 'types/design/paint/types';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

export type TVectorDivideResult = {
  components: TVectorNetworkComponent[];
  crossings: TLineNetworkCrossing[];
  node: TVectorNode;
  vertexLineT: Record<string, number>;
};

export type TVectorConnectedCutResult = {
  fillByKey: Record<string, TPaint[]>;
  filledFaceKeys: string[];
  node: TVectorNode;
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
};
