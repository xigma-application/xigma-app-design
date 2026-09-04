import { useEffect } from 'react';

// others
import CHECKERBOARD_FRAGMENT_SHADER_SOURCE from 'constant/webgl/checkerboardFragmentShaderSource';
import FRAGMENT_SHADER_SOURCE from 'constant/webgl/fragmentShaderSource';
import GRID_FRAGMENT_SHADER_SOURCE from 'constant/webgl/gridFragmentShaderSource';
import GRID_VERTEX_SHADER_SOURCE from 'constant/webgl/gridVertexShaderSource';
import IMAGE_FRAGMENT_SHADER_SOURCE from 'constant/webgl/imageFragmentShaderSource';
import IMAGE_VERTEX_SHADER_SOURCE from 'constant/webgl/imageVertexShaderSource';
import MASK_COMPOSITE_FRAGMENT_SHADER_SOURCE from 'constant/webgl/maskCompositeFragmentShaderSource';
import MASK_COMPOSITE_VERTEX_SHADER_SOURCE from 'constant/webgl/maskCompositeVertexShaderSource';
import MSDF_FRAGMENT_SHADER_SOURCE from 'constant/webgl/msdfFragmentShaderSource';
import VECTOR_DRAG_VERTEX_SHADER_SOURCE from 'constant/webgl/vectorDragVertexShaderSource';
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
    const checkerboardProgram = gl && createProgram(gl, GRID_VERTEX_SHADER_SOURCE, CHECKERBOARD_FRAGMENT_SHADER_SOURCE);
    const maskCompositeProgram = gl && createProgram(gl, MASK_COMPOSITE_VERTEX_SHADER_SOURCE, MASK_COMPOSITE_FRAGMENT_SHADER_SOURCE);
    const maskCompositeBuffer = gl && gl.createBuffer();
    const dragSnapshotProgram = gl && createProgram(gl, VECTOR_DRAG_VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);

    if (
      canvas &&
      gl &&
      program &&
      buffer &&
      imageProgram &&
      imageBuffer &&
      msdfProgram &&
      msdfBuffer &&
      gridProgram &&
      gridBuffer &&
      checkerboardProgram &&
      maskCompositeProgram &&
      maskCompositeBuffer &&
      dragSnapshotProgram
    ) {
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
        checkerboardProgram,
        maskCompositeProgram,
        maskCompositeBuffer,
        dragSnapshotProgram,
        canvas,
        refs,
      );

      return (): void => {
        stopRenderLoop();
        gl.deleteBuffer(buffer);
        gl.deleteBuffer(imageBuffer);
        gl.deleteBuffer(msdfBuffer);
        gl.deleteBuffer(gridBuffer);
        gl.deleteBuffer(maskCompositeBuffer);
        gl.deleteProgram(program);
        gl.deleteProgram(imageProgram);
        gl.deleteProgram(msdfProgram);
        gl.deleteProgram(gridProgram);
        gl.deleteProgram(checkerboardProgram);
        gl.deleteProgram(maskCompositeProgram);
        gl.deleteProgram(dragSnapshotProgram);
      };
    }
  }, [refs]);
};
