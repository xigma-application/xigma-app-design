// types
import { TEllipseNode, TRectangleNode } from 'types/design/types';

export type TRectBatch = {
  data: Float32Array;
  floatCount: number;
};

export type TRectBatchResources = {
  buffer: WebGLBuffer;
  program: WebGLProgram;
};

export type TBatchShape = TEllipseNode | TRectangleNode;

export type TRectChunkBounds = {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
};

export type TRectChunk = {
  baseOpacity: number;
  bounds: TRectChunkBounds;
  buffer: WebGLBuffer;
  nodes: TBatchShape[];
  vertexCount: number;
};

export type TRgb = [number, number, number];
