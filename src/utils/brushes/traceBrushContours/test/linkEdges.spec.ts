// utils
import { linkEdges } from '../linkEdges';

describe('linkEdges', () => {
  it('should register both edges and link them to each other', () => {
    // before
    const graph = { edges: new Map(), links: new Map() };

    // action
    linkEdges(graph, { key: 'a', x: 0, y: 0 }, { key: 'b', x: 1, y: 1 });
    linkEdges(graph, { key: 'b', x: 1, y: 1 }, { key: 'c', x: 2, y: 2 });

    // result
    expect([...graph.edges.keys()]).toEqual(['a', 'b', 'c']);
    expect(graph.links.get('b')).toEqual(['a', 'c']);
    expect(graph.links.get('a')).toEqual(['b']);
  });
});
