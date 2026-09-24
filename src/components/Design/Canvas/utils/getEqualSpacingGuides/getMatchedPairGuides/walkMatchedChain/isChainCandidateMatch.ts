// types
import { TAxisEdges } from './getAxisEdges';

export const isChainCandidateMatch = (
  metrics: TAxisEdges,
  activeMetrics: TAxisEdges,
  sizeToleranceWorldUnits: number,
  centreToleranceWorldUnits: number,
): boolean =>
  Math.abs(metrics.length - activeMetrics.length) <= sizeToleranceWorldUnits &&
  Math.abs(metrics.breadth - activeMetrics.breadth) <= sizeToleranceWorldUnits &&
  Math.abs(metrics.centre - activeMetrics.centre) <= centreToleranceWorldUnits;
