import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { FC, ReactNode } from 'react';

export type TTooltipProviderProps = {
  children: ReactNode;
  skipDelayDuration?: number;
  timeoutEnter?: number;
};

export const TooltipProvider: FC<TTooltipProviderProps> = ({ children, skipDelayDuration = 500, timeoutEnter = 1000 }) => (
  <TooltipPrimitive.Provider delayDuration={timeoutEnter} disableHoverableContent skipDelayDuration={skipDelayDuration}>
    {children}
  </TooltipPrimitive.Provider>
);

export default TooltipProvider;
