// types
import { TVectorVertex } from 'types/design/types';

export const getNewPlanarVertexIds = (planarVertices: Record<string, TVectorVertex>, vertices: Record<string, TVectorVertex>): string[] =>
  Object.keys(planarVertices).filter((id) => !(id in vertices));
