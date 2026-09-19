// types
import { TContourEdge, TContourGraph } from './types';

export const linkEdges = (graph: TContourGraph, first: TContourEdge, second: TContourEdge): void => {
  graph.edges.set(first.key, first);
  graph.edges.set(second.key, second);
  graph.links.set(first.key, [...(graph.links.get(first.key) ?? []), second.key]);
  graph.links.set(second.key, [...(graph.links.get(second.key) ?? []), first.key]);
};
