// types
import { TVectorNode } from 'types/design/types';

export type TVectorNetworkData = Pick<TVectorNode, 'filledFaceKeys' | 'segments' | 'vertexHandleModes' | 'vertices'>;

export type TSurvivingFace = { key: string; originalKey: string };
