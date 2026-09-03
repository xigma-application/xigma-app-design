import { ChangeEvent, Dispatch, SetStateAction } from 'react';

export const useHandleZoomInputChange = (setValue: Dispatch<SetStateAction<string>>): ((event: ChangeEvent<HTMLInputElement>) => void) => {
  return (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.currentTarget.value.replace(/[^\d]/g, ''));
  };
};
