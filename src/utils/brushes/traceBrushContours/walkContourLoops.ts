// types
import { TContourGraph, TContourPoint } from './types';

const walkLoop = (graph: TContourGraph, startKey: string, visited: Set<string>): TContourPoint[] => {
  const loop: TContourPoint[] = [];
  let current: string | undefined = startKey;
  let previous = '';

  while (current !== undefined && !visited.has(current)) {
    visited.add(current);
    loop.push(graph.edges.get(current) as TContourPoint);

    const next: string | undefined = (graph.links.get(current) ?? []).find(
      (candidate) => candidate !== previous && !visited.has(candidate),
    );

    previous = current;
    current = next;
  }

  return loop;
};

export const walkContourLoops = (graph: TContourGraph): TContourPoint[][] => {
  const visited = new Set<string>();
  const loops: TContourPoint[][] = [];

  graph.edges.forEach((_, startKey) => {
    if (!visited.has(startKey)) {
      loops.push(walkLoop(graph, startKey, visited));
    }
  });

  return loops;
};
