// types
import { TTrackedGlState } from './types';

export const trackBlendFunc = (gl: WebGL2RenderingContext, state: TTrackedGlState): void => {
  const blendFunc = gl.blendFunc.bind(gl);
  const blendFuncSeparate = gl.blendFuncSeparate.bind(gl);

  gl.blendFunc = (source: number, destination: number): void => {
    blendFunc(source, destination);
    state.blend = [source, destination, source, destination];
  };

  gl.blendFuncSeparate = (sourceRgb: number, destinationRgb: number, sourceAlpha: number, destinationAlpha: number): void => {
    blendFuncSeparate(sourceRgb, destinationRgb, sourceAlpha, destinationAlpha);
    state.blend = [sourceRgb, destinationRgb, sourceAlpha, destinationAlpha];
  };
};
