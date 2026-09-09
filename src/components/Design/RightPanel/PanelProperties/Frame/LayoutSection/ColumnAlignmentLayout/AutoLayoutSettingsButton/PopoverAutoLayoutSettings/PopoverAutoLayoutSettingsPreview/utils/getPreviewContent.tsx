import { TFunction } from 'i18next';
import { ReactNode } from 'react';

// components
import PreviewAlignTextBaseline from '../PreviewAlignTextBaseline/PreviewAlignTextBaseline';
import PreviewAutoSpacing from '../PreviewAutoSpacing/PreviewAutoSpacing';
import PreviewCanvasStacking from '../PreviewCanvasStacking/PreviewCanvasStacking';
import PreviewInsideStroke from '../PreviewInsideStroke/PreviewInsideStroke';
import PreviewLayout from '../PreviewLayout/PreviewLayout';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from '../popover-auto-layout-settings-preview.module.scss';

// types
import { TAlignTextBaseline, TAutoSpacing, TCanvasStacking, TInsideStroke, TLayoutVersion } from '../../types';

export type TPreviewValues = {
  alignTextBaseline: TAlignTextBaseline | null;
  autoSpacing: TAutoSpacing | null;
  canvasStacking: TCanvasStacking | null;
  insideStroke: TInsideStroke | null;
  layout: TLayoutVersion | null;
};

export const getPreviewContent = (values: TPreviewValues, t: TFunction): ReactNode => {
  const { alignTextBaseline, autoSpacing, canvasStacking, insideStroke, layout } = values;

  const state = insideStroke
    ? { kind: 'insideStroke' as const, value: insideStroke }
    : canvasStacking
      ? { kind: 'canvasStacking' as const, value: canvasStacking }
      : alignTextBaseline
        ? { kind: 'alignTextBaseline' as const, value: alignTextBaseline }
        : autoSpacing
          ? { kind: 'autoSpacing' as const, value: autoSpacing }
          : layout
            ? { kind: 'layout' as const, value: layout }
            : { kind: 'placeholder' as const };

  switch (state.kind) {
    case 'insideStroke':
      return <PreviewInsideStroke value={state.value} />;
    case 'canvasStacking':
      return <PreviewCanvasStacking value={state.value} />;
    case 'alignTextBaseline':
      return <PreviewAlignTextBaseline value={state.value} />;
    case 'autoSpacing':
      return <PreviewAutoSpacing value={state.value} />;
    case 'layout':
      return <PreviewLayout value={state.value} />;
    default:
      return <span className={styles.PopoverAutoLayoutSettingsPreview__label}>{t(`${translationNameSpace}.preview`)}</span>;
  }
};
