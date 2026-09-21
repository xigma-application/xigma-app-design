import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useExportPreview } from '../hooks/useExportPreview';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './export-preview.module.scss';

export type TExportPreviewProps = { nodeId: string };

export const ExportPreview: FC<TExportPreviewProps> = ({ nodeId }) => {
  const { t } = useTranslation();
  const previewUrl = useExportPreview(nodeId);

  return (
    <UITools.Accordion
      items={[
        {
          className: styles.ExportPreview__header,
          content: (
            <div className={styles.ExportPreview__texture}>
              <div className={styles.ExportPreview__image} style={previewUrl ? { backgroundImage: `url("${previewUrl}")` } : undefined} />
            </div>
          ),
          icon: 'ChevronRight',
          iconRotation: { collapsed: 0, expanded: 90 },
          iconSize: 16,
          label: t(`${translationNameSpace}.preview.label`),
        },
      ]}
    />
  );
};

export default ExportPreview;
