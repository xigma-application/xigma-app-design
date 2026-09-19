import { FC } from 'react';

// others
import { STROKE_PROFILE_IMAGES, STROKE_PROFILE_PREVIEW_WIDTH_PX, STROKE_PROFILE_UNIFORM_PREVIEW_HEIGHT_PX } from 'constant/strokeProfile';

// styles
import styles from './stroke-profile-preview.module.scss';

// types
import { StrokeProfile } from 'types/design/enums';

export type TStrokeProfilePreviewProps = {
  label: string;
  profile: StrokeProfile;
};

export const StrokeProfilePreview: FC<TStrokeProfilePreviewProps> = ({ label, profile }) => {
  if (profile === StrokeProfile.uniform) {
    return (
      <div
        aria-label={label}
        className={styles.StrokeProfilePreview__uniform}
        role="img"
        style={{ height: STROKE_PROFILE_UNIFORM_PREVIEW_HEIGHT_PX, width: STROKE_PROFILE_PREVIEW_WIDTH_PX }}
      />
    );
  }

  return (
    <img
      alt={label}
      className={styles.StrokeProfilePreview__image}
      src={STROKE_PROFILE_IMAGES[profile]}
      width={STROKE_PROFILE_PREVIEW_WIDTH_PX}
    />
  );
};

export default StrokeProfilePreview;
