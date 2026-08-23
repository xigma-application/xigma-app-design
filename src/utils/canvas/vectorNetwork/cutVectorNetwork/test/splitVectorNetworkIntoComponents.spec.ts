// types
import { TVectorNetworkComponent } from '../types';

// utils
import { splitVectorNetworkIntoComponents } from '../splitVectorNetworkIntoComponents';

describe('splitVectorNetworkIntoComponents', () => {
  it('should return a single component when the whole network is connected', () => {
    // mock — a-b-c chain
    const network: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 200, y: 0 } },
    };

    // before
    const components = splitVectorNetworkIntoComponents(network);

    // result
    expect(components).toHaveLength(1);
    expect(Object.keys(components[0].vertices).sort()).toEqual(['a', 'b', 'c']);
    expect(Object.keys(components[0].segments).sort()).toEqual(['s1', 's2']);
  });

  it('should split two disjoint sub-graphs into two components with correctly partitioned membership', () => {
    // mock — a-b pair, disconnected from c-d pair
    const network: TVectorNetworkComponent = {
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      vertexHandleModes: { a: 'corner', c: 'smooth' },
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 0, y: 100 },
        d: { id: 'd', x: 100, y: 100 },
      },
    };

    // before
    const components = splitVectorNetworkIntoComponents(network);

    // result
    expect(components).toHaveLength(2);

    const componentContainingA = components.find((component) => 'a' in component.vertices);
    const componentContainingC = components.find((component) => 'c' in component.vertices);

    expect(Object.keys(componentContainingA!.vertices).sort()).toEqual(['a', 'b']);
    expect(Object.keys(componentContainingA!.segments)).toEqual(['s1']);
    expect(componentContainingA!.vertexHandleModes).toEqual({ a: 'corner' });

    expect(Object.keys(componentContainingC!.vertices).sort()).toEqual(['c', 'd']);
    expect(Object.keys(componentContainingC!.segments)).toEqual(['s2']);
    expect(componentContainingC!.vertexHandleModes).toEqual({ c: 'smooth' });
  });

  it('should drop an isolated, segment-less vertex rather than emit it as its own component', () => {
    // mock — a-b pair plus a lone, disconnected vertex "lonely"
    const network: TVectorNetworkComponent = {
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, lonely: { id: 'lonely', x: 500, y: 500 } },
    };

    // before
    const components = splitVectorNetworkIntoComponents(network);

    // result
    expect(components).toHaveLength(1);
    expect(Object.keys(components[0].vertices).sort()).toEqual(['a', 'b']);
  });
});
