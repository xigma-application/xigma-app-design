import { FC } from 'react';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';

// hooks
import { useImageCropHeaderLabel } from './hooks/useImageCropHeaderLabel';

const ImageCropHeader: FC = () => {
  const label = useImageCropHeaderLabel();

  return <PanelHeader buttons={null} e2eValue="image-crop" label={label} />;
};

export default ImageCropHeader;
