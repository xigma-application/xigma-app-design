// others
import { DASH_GAP_PX, DASH_LENGTH_PX } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { getDashedVectorPathVertices } from './getDashedVectorPathVertices';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorChainArcLengthTable } from 'utils/canvas/vectorNetwork/getVectorChainArcLengthTable';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

export const drawDashedVectorPathOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  color: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const rendered = getRenderedVectorNode(node);
  const chainOrder = getVectorChainOrder(rendered);

  if (chainOrder) {
    const table = getVectorChainArcLengthTable(rendered, chainOrder);
    const totalLength = table[table.length - 1].length;

    if (totalLength !== 0) {
      const dashVertices = getDashedVectorPathVertices(rendered, table, totalLength, viewport.zoom, DASH_LENGTH_PX, DASH_GAP_PX);
      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const colorLocation = gl.getUniformLocation(program, 'u_color');
      const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
      const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

      gl.useProgram(program);
      gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
      gl.uniform1f(zoomLocation, viewport.zoom);
      gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dashVertices), gl.STATIC_DRAW);
      gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
      gl.drawArrays(gl.LINES, 0, dashVertices.length / 2);
    }
  }
};
