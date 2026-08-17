import { RefObject, useEffect } from 'react';

// others
import FRAGMENT_SHADER_SOURCE from 'constant/webgl/fragmentShaderSource';
import IMAGE_FRAGMENT_SHADER_SOURCE from 'constant/webgl/imageFragmentShaderSource';
import IMAGE_VERTEX_SHADER_SOURCE from 'constant/webgl/imageVertexShaderSource';
import MSDF_FRAGMENT_SHADER_SOURCE from 'constant/webgl/msdfFragmentShaderSource';
import VERTEX_SHADER_SOURCE from 'constant/webgl/vertexShaderSource';
import { WEBGL_CONTEXT_ATTRIBUTES, WEBGL_CONTEXT_ID } from '../../constants';

// types
import { TCornerRadiusDragState, TPolygonCornerRadiusDragState } from '../useSelectionTool/types';
import { TDraftRect } from 'types/canvas';
import { TDraftEntity } from 'types/design/types';
import { TImageRenderContext } from './types';

// utils
import { createProgram } from './utils/createProgram';
import { startRenderLoop } from './utils/startRenderLoop';

export const useCanvasRenderLoop = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draftRef?: RefObject<TDraftEntity | null>,
  marqueeRef?: RefObject<TDraftRect | null>,
  hoverRef?: RefObject<string | null>,
  sliceRef?: RefObject<(TDraftRect & { rotation: number }) | null>,
  cornerRadiusDragRef?: RefObject<TCornerRadiusDragState | null>,
  polygonCornerRadiusDragRef?: RefObject<TPolygonCornerRadiusDragState | null>,
): void => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext(WEBGL_CONTEXT_ID, WEBGL_CONTEXT_ATTRIBUTES);
    const program = gl && createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    const buffer = gl && gl.createBuffer();
    const imageProgram = gl && createProgram(gl, IMAGE_VERTEX_SHADER_SOURCE, IMAGE_FRAGMENT_SHADER_SOURCE);
    const imageBuffer = gl && gl.createBuffer();
    const msdfProgram = gl && createProgram(gl, IMAGE_VERTEX_SHADER_SOURCE, MSDF_FRAGMENT_SHADER_SOURCE);
    const msdfBuffer = gl && gl.createBuffer();

    if (canvas && gl && program && buffer && imageProgram && imageBuffer && msdfProgram && msdfBuffer) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const imageContext: TImageRenderContext = {
        buffer: imageBuffer,
        cache: new Map(),
        ellipseArcLengthCache: new Map(),
        msdfBuffer,
        msdfProgram,
        program: imageProgram,
        textGeometryCache: new Map(),
      };
      const stopRenderLoop = startRenderLoop(
        gl,
        program,
        buffer,
        imageContext,
        canvas,
        draftRef,
        marqueeRef,
        hoverRef,
        sliceRef,
        cornerRadiusDragRef,
        polygonCornerRadiusDragRef,
      );

      return (): void => {
        stopRenderLoop();
        gl.deleteBuffer(buffer);
        gl.deleteBuffer(imageBuffer);
        gl.deleteBuffer(msdfBuffer);
      };
    }
  }, [canvasRef, draftRef, marqueeRef, hoverRef, sliceRef, cornerRadiusDragRef, polygonCornerRadiusDragRef]);
};
