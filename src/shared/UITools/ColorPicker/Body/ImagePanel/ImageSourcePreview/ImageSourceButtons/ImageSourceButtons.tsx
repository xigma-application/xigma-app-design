import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// hooks
import { useHandleFileInputChange } from './hooks/useHandleFileInputChange';
import { useTriggerFileInput } from './hooks/useTriggerFileInput';

// others
import { translationNameSpace } from '../../constants';

export type TImageSourceButtonsProps = { onSelectFile: TFunc<[File]> };

export const ImageSourceButtons: FC<TImageSourceButtonsProps> = ({ onSelectFile }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleUploadClick = useTriggerFileInput(inputRef);
  const handleFileInputChange = useHandleFileInputChange(onSelectFile);

  return (
    <>
      <input accept="image/*" hidden onChange={handleFileInputChange} ref={inputRef} type="file" />
      <UITools.Button color="primary" onClick={handleUploadClick} size="small" variant="solid">
        {t(`${translationNameSpace}.uploadFromComputerLabel`)}
      </UITools.Button>
      <UITools.Button color="secondary" size="small" variant="solid">
        <Icon name="Image" size={24} />
        {t(`${translationNameSpace}.makeAnImageLabel`)}
      </UITools.Button>
    </>
  );
};

export default ImageSourceButtons;
