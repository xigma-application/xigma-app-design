import { Dispatch, SetStateAction } from 'react';

export const useHandleOpenChange = (
  setIsOpen: Dispatch<SetStateAction<boolean>>,
  handlePopoverOpenChange: TFunc<[boolean]>,
): TFunc<[boolean]> => {
  return (open: boolean): void => {
    setIsOpen(open);
    handlePopoverOpenChange(open);
  };
};
