import { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useHandleFileInputChange } from './hooks/useHandleFileInputChange';
import { useTriggerFileInput } from './hooks/useTriggerFileInput';

// others
import { translationNameSpace } from '../../constants';

export type TVideoSourceButtonsProps = { onSelectFile: TFunc<[File]> };

export const VideoSourceButtons: FC<TVideoSourceButtonsProps> = ({ onSelectFile }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleUploadClick = useTriggerFileInput(inputRef);
  const handleFileInputChange = useHandleFileInputChange(onSelectFile);

  return (
    <>
      <input accept="video/*" hidden onChange={handleFileInputChange} ref={inputRef} type="file" />
      <UITools.Button color="primary" onClick={handleUploadClick} size="small" variant="solid">
        {t(`${translationNameSpace}.uploadFromComputerLabel`)}
      </UITools.Button>
    </>
  );
};

export default VideoSourceButtons;
