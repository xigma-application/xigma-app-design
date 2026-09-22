import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ExportPreview from './ExportPreview/ExportPreview';
import ExportRow from './ExportRow/ExportRow';
import FillDropIndicator from '../Common/FillSection/FillDropIndicator/FillDropIndicator';
import { UITools } from 'shared';

// hooks
import { useExportSection } from './hooks/useExportSection/useExportSection';
import { useHandleExportClick } from './hooks/useHandleExportClick';

// others
import { translationNameSpace } from './constants';

// store
import { selectIsExporting } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './export.module.scss';

const Export: FC = () => {
  const { t } = useTranslation();
  const {
    containerRef,
    dropIndicatorOffset,
    exportTarget,
    isRowDragging,
    isRowSelected,
    onAdd,
    onChange,
    onRemove,
    onSelectRow,
    onStartDrag,
    registerRow,
    settings,
  } = useExportSection();
  const isExporting = useAppSelector(selectIsExporting);
  const handleExportClick = useHandleExportClick(exportTarget, settings);

  return (
    <UITools.Section
      addAriaLabel={t(`${translationNameSpace}.addAriaLabel`)}
      addTooltip={t(`${translationNameSpace}.addTooltip`)}
      e2eValue="export"
      hasContent={settings.length > 0}
      label={t(`${translationNameSpace}.section.label`)}
      mutedWhenEmpty
      onAdd={onAdd}
    >
      <div className={styles.Export__rows} ref={containerRef}>
        {dropIndicatorOffset !== null && <FillDropIndicator offset={dropIndicatorOffset} />}
        {settings.map((setting, index) => (
          <ExportRow
            canDrag={settings.length > 1}
            isDragging={isRowDragging(index)}
            isSelected={isRowSelected(index)}
            key={index}
            onChange={(next): void => onChange(index, next)}
            onRemove={(): void => onRemove(index)}
            onSelect={(): void => onSelectRow(index)}
            onStartDrag={(event): void => onStartDrag(index, event)}
            registerRow={registerRow(index)}
            setting={setting}
          />
        ))}
      </div>
      {settings.length > 0 && (
        <div className={styles.Export__footer}>
          <UITools.Button
            className={styles.Export__exportButton}
            color="secondary"
            disabled={isExporting}
            onClick={handleExportClick}
            variant="outline"
          >
            {t(`${translationNameSpace}.exportButton`, { name: exportTarget.name })}
          </UITools.Button>
          <ExportPreview nodeId={exportTarget.id} />
        </div>
      )}
    </UITools.Section>
  );
};

export default Export;
