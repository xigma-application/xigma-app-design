import { useEffect } from 'react';

// others
import blendCompositeFragmentShaderSource from 'constant/webgl/blendCompositeFragmentShaderSource';
import blurFragmentShaderSource from 'constant/webgl/blurFragmentShaderSource';
import checkerboardFragmentShaderSource from 'constant/webgl/checkerboardFragmentShaderSource';
import fragmentShaderSource from 'constant/webgl/fragmentShaderSource';
import gridFragmentShaderSource from 'constant/webgl/gridFragmentShaderSource';
import gridVertexShaderSource from 'constant/webgl/gridVertexShaderSource';
import imageFragmentShaderSource from 'constant/webgl/imageFragmentShaderSource';
import imageVertexShaderSource from 'constant/webgl/imageVertexShaderSource';
import maskCompositeFragmentShaderSource from 'constant/webgl/maskCompositeFragmentShaderSource';
import maskCompositeUvVertexShaderSource from 'constant/webgl/maskCompositeUvVertexShaderSource';
import maskCompositeVertexShaderSource from 'constant/webgl/maskCompositeVertexShaderSource';
import msdfFragmentShaderSource from 'constant/webgl/msdfFragmentShaderSource';
import noiseFragmentShaderSource from 'constant/webgl/noiseFragmentShaderSource';
import patternSourceTileFragmentShaderSource from 'constant/webgl/patternSourceTileFragmentShaderSource';
import vectorDragVertexShaderSource from 'constant/webgl/vectorDragVertexShaderSource';
import vectorGradientFillFragmentShaderSource from 'constant/webgl/vectorGradientFillFragmentShaderSource';
import vectorGradientFillVertexShaderSource from 'constant/webgl/vectorGradientFillVertexShaderSource';
import vertexShaderSource from 'constant/webgl/vertexShaderSource';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { createProgram } from './utils/createProgram';
import { getCachedGlContext } from './utils/getCachedGlContext';
import { setupRenderLoop } from './utils/setupRenderLoop';

export const useCanvasRenderLoop = (refs: TCanvasRefs): void => {
  useEffect(() => {
    const canvas = refs.canvasRef.current;
    const gl = getCachedGlContext(canvas ?? null);
    const program = gl && createProgram(gl, vertexShaderSource, fragmentShaderSource);
    const buffer = gl && gl.createBuffer();
    const imageProgram = gl && createProgram(gl, imageVertexShaderSource, imageFragmentShaderSource);
    const imageBuffer = gl && gl.createBuffer();
    const msdfProgram = gl && createProgram(gl, imageVertexShaderSource, msdfFragmentShaderSource);
    const msdfBuffer = gl && gl.createBuffer();
    const gridProgram = gl && createProgram(gl, gridVertexShaderSource, gridFragmentShaderSource);
    const gridBuffer = gl && gl.createBuffer();
    const checkerboardProgram = gl && createProgram(gl, gridVertexShaderSource, checkerboardFragmentShaderSource);
    const maskCompositeProgram = gl && createProgram(gl, maskCompositeUvVertexShaderSource, maskCompositeFragmentShaderSource);
    const maskCompositeBuffer = gl && gl.createBuffer();
    const blendCompositeProgram = gl && createProgram(gl, maskCompositeVertexShaderSource, blendCompositeFragmentShaderSource);
    const blendCompositeBuffer = gl && gl.createBuffer();
    const blurProgram = gl && createProgram(gl, maskCompositeVertexShaderSource, blurFragmentShaderSource);
    const blurBuffer = gl && gl.createBuffer();
    const noiseProgram = gl && createProgram(gl, vertexShaderSource, noiseFragmentShaderSource);
    const dragSnapshotProgram = gl && createProgram(gl, vectorDragVertexShaderSource, fragmentShaderSource);
    const gradientProgram = gl && createProgram(gl, vectorGradientFillVertexShaderSource, vectorGradientFillFragmentShaderSource);
    const dragGradientProgram = gl && createProgram(gl, vectorGradientFillVertexShaderSource, vectorGradientFillFragmentShaderSource);
    const patternTileProgram = gl && createProgram(gl, vectorGradientFillVertexShaderSource, patternSourceTileFragmentShaderSource);

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
      blendCompositeProgram &&
      blendCompositeBuffer &&
      blurProgram &&
      blurBuffer &&
      noiseProgram &&
      dragSnapshotProgram &&
      gradientProgram &&
      dragGradientProgram &&
      patternTileProgram
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
        blendCompositeProgram,
        blendCompositeBuffer,
        blurProgram,
        blurBuffer,
        noiseProgram,
        dragSnapshotProgram,
        gradientProgram,
        dragGradientProgram,
        patternTileProgram,
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
        gl.deleteBuffer(blendCompositeBuffer);
        gl.deleteBuffer(blurBuffer);
        gl.deleteProgram(program);
        gl.deleteProgram(imageProgram);
        gl.deleteProgram(msdfProgram);
        gl.deleteProgram(gridProgram);
        gl.deleteProgram(checkerboardProgram);
        gl.deleteProgram(maskCompositeProgram);
        gl.deleteProgram(blendCompositeProgram);
        gl.deleteProgram(blurProgram);
        gl.deleteProgram(noiseProgram);
        gl.deleteProgram(dragSnapshotProgram);
        gl.deleteProgram(gradientProgram);
        gl.deleteProgram(dragGradientProgram);
        gl.deleteProgram(patternTileProgram);
      };
    }
  }, [refs]);
};
