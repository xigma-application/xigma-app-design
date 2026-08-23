// types
import { TLineNetworkCrossing, TVectorNetworkComponent } from 'utils/canvas/vectorNetwork/cutVectorNetwork/types';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

export type TVectorDivideResult = {
  components: TVectorNetworkComponent[];
  crossings: TLineNetworkCrossing[];
  node: TVectorNode;
  vertexLineT: Record<string, number>;
};

export type TVectorConnectedCutResult = {
  filledFaceKeys: string[];
  node: TVectorNode;
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TVectorVertex>;
};
