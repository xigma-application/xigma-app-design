import { CSSProperties, FC } from 'react';

// assets
import blankMediaUrl from 'assets/images/blank-media.png';

// components
import ImageSourceButtons from './ImageSourceButtons/ImageSourceButtons';

// hooks
import { TUseImagePanelResult } from '../hooks/useImagePanel';

// styles
import styles from './image-source-preview.module.scss';

export type TImageSourcePreviewProps = { imagePanel: TUseImagePanelResult };

export const ImageSourcePreview: FC<TImageSourcePreviewProps> = ({ imagePanel }) => {
  const { imageUrl, setImage } = imagePanel;
  const sourceButtons = <ImageSourceButtons onSelectFile={setImage} />;

  return (
    <div
      className={styles.ImageSourcePreview}
      style={
        imageUrl
          ? ({
              backgroundImage: `url("${imageUrl}"), url("${blankMediaUrl}")`,
              backgroundPosition: 'center, center',
              backgroundRepeat: 'no-repeat, repeat',
              backgroundSize: 'contain, 208px 208px',
            } as CSSProperties)
          : undefined
      }
    >
      {imageUrl ? <div className={styles.ImageSourcePreview__overlay}>{sourceButtons}</div> : sourceButtons}
    </div>
  );
};

export default ImageSourcePreview;
