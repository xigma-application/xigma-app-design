// types
import { NodeType } from 'types/design/enums';
import { TVectorNetworkComponent } from '../types';

// utils
import { deriveVectorFaces, TVectorFace } from '../../deriveVectorFaces/deriveVectorFaces';

export const deriveClosedFaces = (
  segments: TVectorNetworkComponent['segments'],
  component: Pick<TVectorNetworkComponent, 'vertexHandleModes' | 'vertices'>,
): TVectorFace[] =>
  deriveVectorFaces({
    defaultFill: null,
    filledFaceKeys: [],
    id: '__cut-fill-probe',
    name: '',
    parentId: null,
    rotation: 0,
    segments,
    strokeWidth: 1,
    strokes: [],
    type: NodeType.vector,
    vertexHandleModes: component.vertexHandleModes,
    vertices: component.vertices,
  });
