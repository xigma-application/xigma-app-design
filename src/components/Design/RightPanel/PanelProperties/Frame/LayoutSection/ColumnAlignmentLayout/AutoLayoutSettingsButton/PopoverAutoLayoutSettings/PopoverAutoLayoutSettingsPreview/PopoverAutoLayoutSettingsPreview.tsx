import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// styles
import styles from './popover-auto-layout-settings-preview.module.scss';

// types
import { TAlignTextBaseline, TAutoSpacing, TCanvasStacking, TInsideStroke, TLayoutVersion } from '../types';

// utils
import { getPreviewContent } from './utils/getPreviewContent';

export type TPopoverAutoLayoutSettingsPreviewProps = {
  alignTextBaseline: TAlignTextBaseline | null;
  autoSpacing: TAutoSpacing | null;
  canvasStacking: TCanvasStacking | null;
  insideStroke: TInsideStroke | null;
  isLegacyLayout: boolean;
  layout: TLayoutVersion | null;
};

export const PopoverAutoLayoutSettingsPreview: FC<TPopoverAutoLayoutSettingsPreviewProps> = ({
  alignTextBaseline,
  autoSpacing,
  canvasStacking,
  insideStroke,
  isLegacyLayout,
  layout,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.PopoverAutoLayoutSettingsPreview}>
      {getPreviewContent({ alignTextBaseline, autoSpacing, canvasStacking, insideStroke, isLegacyLayout, layout }, t)}
    </div>
  );
};

export default PopoverAutoLayoutSettingsPreview;
