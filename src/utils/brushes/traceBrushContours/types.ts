export type TCellEdgeName = 'bottom' | 'left' | 'right' | 'top';
export type TContourEdge = { key: string; x: number; y: number };
export type TContourGraph = { edges: Map<string, TContourEdge>; links: Map<string, string[]> };
export type TContourPoint = { x: number; y: number };
