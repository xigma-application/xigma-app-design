import { ReactNode } from 'react';

export const isRenderItem = <TItem>(
  children: ReactNode | ((item: TItem, index: number) => ReactNode),
): children is (item: TItem, index: number) => ReactNode => typeof children === 'function';
