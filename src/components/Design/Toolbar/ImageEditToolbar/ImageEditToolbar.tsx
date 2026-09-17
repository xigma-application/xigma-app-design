import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ImageEditMoreDropdown from './ImageEditMoreDropdown/ImageEditMoreDropdown';
import ToolbarButton from '../ToolbarButton/ToolbarButton';

// hooks
import { useImageEditToolbar } from './hooks/useImageEditToolbar';

// others
import { SELECT_AREA_SHORTCUT, translationNameSpace } from './constants';

// styles
import styles from './image-edit-toolbar.module.scss';

const ImageEditToolbar: FC = () => {
  const { t } = useTranslation();
  const { handleToggleSelectArea, isSelectAreaActive, isVisible } = useImageEditToolbar();

  if (!isVisible) {
    return null;
  }

  const cropLabel = t(`${translationNameSpace}.crop`);
  const selectAreaLabel = t(`${translationNameSpace}.selectArea`);
  const removeBackgroundLabel = t(`${translationNameSpace}.removeBackground`);
  const editWithPromptLabel = t(`${translationNameSpace}.editWithPrompt`);

  return (
    <div className={styles.ImageEditToolbar}>
      <ToolbarButton icon="Crop" isActive={false} label={cropLabel} tooltip={cropLabel} />
      <ToolbarButton
        icon="LassoTool"
        isActive={isSelectAreaActive}
        label={selectAreaLabel}
        onClick={handleToggleSelectArea}
        shortcut={SELECT_AREA_SHORTCUT}
        tooltip={selectAreaLabel}
      />
      <ToolbarButton icon="AiBackgroundRemove" isActive={false} label={removeBackgroundLabel} tooltip={removeBackgroundLabel} />
      <ToolbarButton icon="AiEditWithPrompt" isActive={false} label={editWithPromptLabel} tooltip={editWithPromptLabel} />
      <div className={styles.ImageEditToolbar__separator} />
      <ImageEditMoreDropdown />
    </div>
  );
};

export default ImageEditToolbar;
