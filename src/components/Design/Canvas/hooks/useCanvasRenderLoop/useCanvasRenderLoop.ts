import { useEffect } from 'react';

// others
import FRAGMENT_SHADER_SOURCE from 'constant/webgl/fragmentShaderSource';
import GRID_FRAGMENT_SHADER_SOURCE from 'constant/webgl/gridFragmentShaderSource';
import GRID_VERTEX_SHADER_SOURCE from 'constant/webgl/gridVertexShaderSource';
import IMAGE_FRAGMENT_SHADER_SOURCE from 'constant/webgl/imageFragmentShaderSource';
import IMAGE_VERTEX_SHADER_SOURCE from 'constant/webgl/imageVertexShaderSource';
import MSDF_FRAGMENT_SHADER_SOURCE from 'constant/webgl/msdfFragmentShaderSource';
import VERTEX_SHADER_SOURCE from 'constant/webgl/vertexShaderSource';
import { WEBGL_CONTEXT_ATTRIBUTES, WEBGL_CONTEXT_ID } from '../../constants';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { createProgram } from './utils/createProgram';
import { setupRenderLoop } from './utils/setupRenderLoop';

export const useCanvasRenderLoop = (refs: TCanvasRefs): void => {
  useEffect(() => {
    const canvas = refs.canvasRef.current;
    const gl = canvas?.getContext(WEBGL_CONTEXT_ID, WEBGL_CONTEXT_ATTRIBUTES);
    const program = gl && createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const buffer = gl && gl.createBuffer();
    const imageProgram = gl && createProgram(gl, IMAGE_VERTEX_SHADER_SOURCE, IMAGE_FRAGMENT_SHADER_SOURCE);
    const imageBuffer = gl && gl.createBuffer();
    const msdfProgram = gl && createProgram(gl, IMAGE_VERTEX_SHADER_SOURCE, MSDF_FRAGMENT_SHADER_SOURCE);
    const msdfBuffer = gl && gl.createBuffer();
    const gridProgram = gl && createProgram(gl, GRID_VERTEX_SHADER_SOURCE, GRID_FRAGMENT_SHADER_SOURCE);
    const gridBuffer = gl && gl.createBuffer();

    if (canvas && gl && program && buffer && imageProgram && imageBuffer && msdfProgram && msdfBuffer && gridProgram && gridBuffer) {
      const stopRenderLoop = setupRenderLoop(
        gl,
        program,
        buffer,
        imageProgram,
        imageBuffer,
        msdfProgram,
        msdfBuffer,
        gridProgram,
        gridBuffer,
        canvas,
        refs,
      );

      return (): void => {
        stopRenderLoop();
        gl.deleteBuffer(buffer);
        gl.deleteBuffer(imageBuffer);
        gl.deleteBuffer(msdfBuffer);
        gl.deleteBuffer(gridBuffer);
        gl.deleteProgram(program);
        gl.deleteProgram(imageProgram);
        gl.deleteProgram(msdfProgram);
        gl.deleteProgram(gridProgram);
      };
    }
  }, [refs]);
};
