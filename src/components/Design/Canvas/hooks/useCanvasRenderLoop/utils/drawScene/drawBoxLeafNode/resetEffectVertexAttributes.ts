// others
import { EFFECT_VERTEX_ATTRIBUTE_SLOTS } from './constants';

export const resetEffectVertexAttributes = (gl: WebGL2RenderingContext, positionLocation: number): void => {
  for (let slot = 0; slot < EFFECT_VERTEX_ATTRIBUTE_SLOTS; slot += 1) {
    gl.disableVertexAttribArray(slot);
  }

  gl.enableVertexAttribArray(positionLocation);
};
