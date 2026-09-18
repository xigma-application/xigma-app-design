import { ChangeEvent } from 'react';

export const useHandleFileInputChange = (onSelectFile: TFunc<[File]>): TFunc<[ChangeEvent<HTMLInputElement>]> => {
  return (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (file) {
      onSelectFile(file);
    }
  };
};
