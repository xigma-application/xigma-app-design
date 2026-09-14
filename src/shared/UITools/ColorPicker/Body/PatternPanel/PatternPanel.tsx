import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AlignmentGrid from './AlignmentGrid/AlignmentGrid';
import PatternField from './PatternField/PatternField';
import PatternSourcePreview from './PatternSourcePreview/PatternSourcePreview';
import ToggleButtonGroup from 'shared/UITools/ToggleButtonGroup/ToggleButtonGroup';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './pattern-panel.module.scss';

// types
import { TUsePatternPanelResult } from './hooks/usePatternPanel';
import { TPatternTileType } from 'types/design/paint/types';

// utils
import { buildTileTypeButtons } from './utils/buildTileTypeButtons';

export type TPatternPanelProps = { onDragEnd?: TFunc; onDragStart?: TFunc; patternPanel: TUsePatternPanelResult };

export const PatternPanel: FC<TPatternPanelProps> = ({ onDragEnd, onDragStart, patternPanel }) => {
  const { t } = useTranslation();
  const { alignmentIndex, scale, setAlignmentIndex, setScale, setSpacingX, setSpacingY, setTileType, spacingX, spacingY, tileType } =
    patternPanel;

  return (
    <div className={styles.PatternPanel}>
      <PatternSourcePreview />
      <div className={styles.PatternPanel__row}>
        <span className={styles.PatternPanel__label}>{t(`${translationNameSpace}.tileTypeLabel`)}</span>
        <ToggleButtonGroup
          onChange={(value): void => setTileType(value as TPatternTileType)}
          toggleButtons={buildTileTypeButtons(t)}
          value={tileType}
        />
      </div>
      <div className={styles.PatternPanel__row}>
        <span className={styles.PatternPanel__label}>{t(`${translationNameSpace}.scaleLabel`)}</span>
        <PatternField
          ariaLabel={t(`${translationNameSpace}.scaleLabel`)}
          e2eValue="pattern-scale"
          icon="AspectRatio"
          onChange={setScale}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          value={scale}
        />
      </div>
      <div className={styles.PatternPanel__row}>
        <span className={styles.PatternPanel__label}>{t(`${translationNameSpace}.spacingLabel`)}</span>
        <div className={styles.PatternPanel__fields}>
          <PatternField
            ariaLabel={`${t(`${translationNameSpace}.spacingLabel`)} X`}
            e2eValue="pattern-spacing-x"
            label="X"
            onChange={setSpacingX}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            value={spacingX}
          />
          <PatternField
            ariaLabel={`${t(`${translationNameSpace}.spacingLabel`)} Y`}
            e2eValue="pattern-spacing-y"
            label="Y"
            onChange={setSpacingY}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            value={spacingY}
          />
        </div>
      </div>
      <div className={styles.PatternPanel__row}>
        <span className={styles.PatternPanel__label}>{t(`${translationNameSpace}.alignmentLabel`)}</span>
        <AlignmentGrid onChange={setAlignmentIndex} selectedIndex={alignmentIndex} />
      </div>
    </div>
  );
};

export default PatternPanel;
