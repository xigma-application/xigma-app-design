// types
import { NodeType } from 'types/design/enums';
import { TVectorNetworkComponent } from '../types';

// utils
import { deriveVectorFaces, TVectorFace } from '../../deriveVectorFaces';

export const deriveClosedFaces = (
  segments: TVectorNetworkComponent['segments'],
  component: Pick<TVectorNetworkComponent, 'vertexHandleModes' | 'vertices'>,
): TVectorFace[] =>
  deriveVectorFaces({
    fillColor: null,
    filledFaceKeys: [],
    id: '__cut-fill-probe',
    name: '',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: component.vertexHandleModes,
    vertices: component.vertices,
  });
