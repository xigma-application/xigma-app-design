import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ToolbarButton from '../ToolbarButton/ToolbarButton';

// hooks
import { useIsMultiImageEditToolbarVisible } from './hooks/useIsMultiImageEditToolbarVisible';

// others
import { translationNameSpace } from '../ImageEditToolbar/constants';

// styles
import styles from './multi-image-edit-toolbar.module.scss';

const MultiImageEditToolbar: FC = () => {
  const { t } = useTranslation();
  const isVisible = useIsMultiImageEditToolbarVisible();

  if (!isVisible) {
    return null;
  }

  const removeBackgroundLabel = t(`${translationNameSpace}.removeBackground`);
  const boostResolutionLabel = t(`${translationNameSpace}.boostResolution`);

  return (
    <div className={styles.MultiImageEditToolbar}>
      <ToolbarButton icon="AiBackgroundRemove" isActive={false} label={removeBackgroundLabel} tooltip={removeBackgroundLabel} />
      <ToolbarButton icon="AiBoostResolution" isActive={false} label={boostResolutionLabel} tooltip={boostResolutionLabel} />
    </div>
  );
};

export default MultiImageEditToolbar;
