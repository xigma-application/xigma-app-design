import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { FC, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';

// types
import { TVirtualAnchor } from '../../Tree/TreeItem/types';

// utils
import { getAnchorTriggerStyle } from '../utils/getAnchorTriggerStyle';

export type TMenuTriggerProps = {
  anchorRef?: RefObject<TVirtualAnchor>;
  trigger?: ReactNode;
  triggerAriaLabel?: string;
  triggerClassName?: string;
};

export const MenuTrigger: FC<TMenuTriggerProps> = ({ anchorRef, trigger, triggerAriaLabel, triggerClassName }) => {
  if (anchorRef) {
    return createPortal(
      <DropdownMenuPrimitive.Trigger aria-label={triggerAriaLabel} asChild className={triggerClassName}>
        <span aria-hidden style={getAnchorTriggerStyle(anchorRef)} tabIndex={-1} />
      </DropdownMenuPrimitive.Trigger>,
      document.body,
    );
  }

  return (
    <DropdownMenuPrimitive.Trigger aria-label={triggerAriaLabel} className={triggerClassName}>
      {trigger}
    </DropdownMenuPrimitive.Trigger>
  );
};

export default MenuTrigger;
