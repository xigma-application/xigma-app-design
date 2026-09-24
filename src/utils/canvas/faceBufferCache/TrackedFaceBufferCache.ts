// types
import { TPoint } from 'types/canvas';

export class TrackedFaceBufferCache extends WeakMap<TPoint[], WebGLBuffer> {
  readonly all = new Map<TPoint[], WebGLBuffer>();

  readonly touched = new Set<TPoint[]>();

  override get(face: TPoint[]): WebGLBuffer | undefined {
    const buffer = this.all.get(face);

    if (buffer) {
      this.touched.add(face);
    }

    return buffer;
  }

  override set(face: TPoint[], buffer: WebGLBuffer): this {
    this.all.set(face, buffer);
    this.touched.add(face);

    return this;
  }
}
