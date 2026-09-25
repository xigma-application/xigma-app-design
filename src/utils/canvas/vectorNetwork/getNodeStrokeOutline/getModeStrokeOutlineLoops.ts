// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TStrokeableNode } from './types';

// utils
import { getEllipseStrokeShapes } from '../../shapes/getEllipseStrokeShapes';
import { getBoxStrokeRingPolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/getBoxStrokeRingPolygons';
import { getLineStrokeShape } from '../../line/stroke/getLineStrokeShape';
import { getNestingOrientedLoops } from './getNestingOrientedLoops';
import { getRingMode } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/getRingMode';
import { getStrokeDashPattern } from 'utils/design/stroke/getStrokeDashPattern';
import { getVectorStrokeShape } from '../../vector/stroke/getVectorStrokeShape';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getModeStrokeOutlineLoops = (node: TStrokeableNode): TPoint[][] | null => {
  switch (node.type) {
    case NodeType.line: {
      const shape = getLineStrokeShape(node);
      return shape ? getNestingOrientedLoops(shape.polygons) : null;
    }
    case NodeType.rectangle: {
      if (getRingMode(node, getStrokeDashPattern(node)) !== 'uniform') {
        const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
        const loops = getBoxStrokeRingPolygons(node).map((loop) => loop.map((point) => rotatePoint(point, center, -node.rotation)));

        return getNestingOrientedLoops(loops);
      }

      return null;
    }
    case NodeType.ellipse: {
      const shapes = getEllipseStrokeShapes(node);
      return shapes ? getNestingOrientedLoops(shapes.flatMap(({ polygons }) => polygons)) : null;
    }
    case NodeType.vector: {
      const shapes = getVectorStrokeShape(node);
      return shapes ? getNestingOrientedLoops(shapes.flatMap(({ polygons }) => polygons)) : null;
    }
    // no default
  }
};
