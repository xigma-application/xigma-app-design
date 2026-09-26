// types
import { TVectorNode } from 'types/design/types';
import { TVectorStrokeShape } from './types';

// utils
import { getVectorPathStrokeShape } from './getVectorPathStrokeShape';
import { getVectorStrokePaths } from './getVectorStrokePaths';
import { isVectorStrokePathHole } from './isVectorStrokePathHole';

export const getVectorUniformStrokeShape = (node: TVectorNode): TVectorStrokeShape | null => {
  const paths = getVectorStrokePaths(node);
  const shapes = paths.map((path) => getVectorPathStrokeShape(node, path, 'uniform', isVectorStrokePathHole(path, paths)));

  return shapes.length > 0 ? shapes : null;
};
