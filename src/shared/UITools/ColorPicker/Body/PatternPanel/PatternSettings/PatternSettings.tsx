import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AlignmentGrid from '../AlignmentGrid/AlignmentGrid';
import PatternField from '../PatternField/PatternField';
import ToggleButtonGroup from 'shared/UITools/ToggleButtonGroup/ToggleButtonGroup';

// hooks
import { TUsePatternPanelResult } from '../hooks/usePatternPanel';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './pattern-settings.module.scss';

// types
import { TPatternDirection, TPatternTileType } from 'types/design/paint/types';

// utils
import { buildDirectionButtons } from '../utils/buildDirectionButtons';
import { buildTileTypeButtons } from '../utils/buildTileTypeButtons';

const OFFSET_MAX = 1000;
const OFFSET_MIN = -1000;

export type TPatternSettingsProps = { onDragEnd?: TFunc; onDragStart?: TFunc; patternPanel: TUsePatternPanelResult };

export const PatternSettings: FC<TPatternSettingsProps> = ({ onDragEnd, onDragStart, patternPanel }) => {
  const { t } = useTranslation();
  const {
    alignmentIndex,
    direction,
    offsetX,
    offsetY,
    scale,
    setAlignmentIndex,
    setDirection,
    setOffsetX,
    setOffsetY,
    setScale,
    setSpacingX,
    setSpacingY,
    setTileType,
    spacingX,
    spacingY,
    tileType,
  } = patternPanel;

  return (
    <div className={styles.PatternSettings}>
      <div className={styles.PatternSettings__row}>
        <span className={styles.PatternSettings__label}>{t(`${translationNameSpace}.tileTypeLabel`)}</span>
        <ToggleButtonGroup
          onChange={(value): void => setTileType(value as TPatternTileType)}
          toggleButtons={buildTileTypeButtons(t)}
          value={tileType}
        />
      </div>
      {tileType === 'hexagonal' && (
        <div className={styles.PatternSettings__row}>
          <span className={styles.PatternSettings__label}>{t(`${translationNameSpace}.directionLabel`)}</span>
          <ToggleButtonGroup
            onChange={(value): void => setDirection(value as TPatternDirection)}
            toggleButtons={buildDirectionButtons(t)}
            value={direction}
          />
        </div>
      )}
      <div className={styles.PatternSettings__row}>
        <span className={styles.PatternSettings__label}>{t(`${translationNameSpace}.scaleLabel`)}</span>
        <PatternField
          ariaLabel={t(`${translationNameSpace}.scaleLabel`)}
          e2eValue="pattern-scale"
          icon="ScaleTool"
          onChange={setScale}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          value={scale}
        />
      </div>
      <div className={styles.PatternSettings__row}>
        <span className={styles.PatternSettings__label}>{t(`${translationNameSpace}.spacingLabel`)}</span>
        <PatternField
          ariaLabel={`${t(`${translationNameSpace}.spacingLabel`)} X`}
          e2eValue="pattern-spacing-x"
          label="X"
          onChange={setSpacingX}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          value={spacingX}
        />
      </div>
      <div className={styles.PatternSettings__row}>
        <span className={styles.PatternSettings__label} />
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
      <div className={styles.PatternSettings__row}>
        <span className={styles.PatternSettings__label}>{t(`${translationNameSpace}.offsetLabel`)}</span>
        <PatternField
          ariaLabel={`${t(`${translationNameSpace}.offsetLabel`)} X`}
          e2eValue="pattern-offset-x"
          label="X"
          max={OFFSET_MAX}
          min={OFFSET_MIN}
          onChange={setOffsetX}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          suffix="px"
          value={offsetX}
        />
      </div>
      <div className={styles.PatternSettings__row}>
        <span className={styles.PatternSettings__label} />
        <PatternField
          ariaLabel={`${t(`${translationNameSpace}.offsetLabel`)} Y`}
          e2eValue="pattern-offset-y"
          label="Y"
          max={OFFSET_MAX}
          min={OFFSET_MIN}
          onChange={setOffsetY}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          suffix="px"
          value={offsetY}
        />
      </div>
      <div className={styles['PatternSettings__aligment-wrapper']}>
        <div className={styles.PatternSettings__label}>{t(`${translationNameSpace}.alignmentLabel`)}</div>
        <AlignmentGrid onChange={setAlignmentIndex} selectedIndex={alignmentIndex} />
      </div>
    </div>
  );
};

export default PatternSettings;
