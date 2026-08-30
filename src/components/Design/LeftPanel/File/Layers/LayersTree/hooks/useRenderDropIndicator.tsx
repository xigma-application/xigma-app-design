import { ReactNode } from 'react';

// components
import LayersTreeDropIndicator from '../LayersTreeDropIndicator/LayersTreeDropIndicator';

export const useRenderDropIndicator = (): TFunc<[number], ReactNode> => {
  return (depth: number): ReactNode => <LayersTreeDropIndicator depth={depth} />;
};
