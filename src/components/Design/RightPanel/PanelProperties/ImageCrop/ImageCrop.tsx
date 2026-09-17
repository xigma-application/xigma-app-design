import { FC, Fragment } from 'react';

// components
import ImageCropDimensionsSection from './ImageCropDimensionsSection/ImageCropDimensionsSection';
import ImageCropHeader from './ImageCropHeader/ImageCropHeader';
import ImageCropPositionSection from './ImageCropPositionSection/ImageCropPositionSection';

const ImageCrop: FC = () => (
  <Fragment>
    <ImageCropHeader />
    <ImageCropPositionSection />
    <ImageCropDimensionsSection />
  </Fragment>
);

export default ImageCrop;
