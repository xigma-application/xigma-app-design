import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ContrastBadge from './ContrastBadge/ContrastBadge';
import ContrastSettingsMenu from './ContrastSettingsMenu/ContrastSettingsMenu';
import ContrastValuesButton from './ContrastValuesButton/ContrastValuesButton';
import { UITools } from 'shared';

// hooks
import { useContrastSettingsMenu } from './hooks/useContrastSettingsMenu';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './contrast-checker.module.scss';

// types
import { ContrastCategory, ContrastLevel } from './enums';

export type TContrastCheckerProps = {
  backgroundColor: string | null;
  canShowAAA: boolean;
  category: ContrastCategory;
  foregroundColor: string;
  level: ContrastLevel;
  onAutoCorrect: TFunc;
  onSetCategory: TFunc<[ContrastCategory]>;
  onSetLevel: TFunc<[ContrastLevel]>;
  passes: boolean;
  ratio: number | null;
};

export const ContrastChecker: FC<TContrastCheckerProps> = ({
  backgroundColor,
  canShowAAA,
  category,
  foregroundColor,
  level,
  onAutoCorrect,
  onSetCategory,
  onSetLevel,
  passes,
  ratio,
}) => {
  const { t } = useTranslation();
  const { onOpenChange, open } = useContrastSettingsMenu();

  return (
    <div className={styles.ContrastChecker}>
      {ratio !== null && backgroundColor ? (
        <ContrastValuesButton backgroundColor={backgroundColor} foregroundColor={foregroundColor} ratio={ratio} />
      ) : (
        <span className={styles.ContrastChecker__empty}>{t(`${translationNameSpace}.noBackgroundLabel`)}</span>
      )}
      <div className={styles.ContrastChecker__actions}>
        {ratio !== null && (
          <button
            aria-label={t(`${translationNameSpace}.autoCorrectAriaLabel`)}
            className={styles.ContrastChecker__badge}
            disabled={passes}
            onClick={onAutoCorrect}
            type="button"
          >
            <ContrastBadge label={t(`${translationNameSpace}.level.${level}`)} passes={passes} />
          </button>
        )}
        <UITools.Popover
          align="end"
          asChild
          onOpenChange={onOpenChange}
          open={open}
          trigger={
            <UITools.ButtonIcon ariaLabel={t(`${translationNameSpace}.settingsAriaLabel`)} name="Properties" selected={open} size={24} />
          }
        >
          <ContrastSettingsMenu
            canShowAAA={canShowAAA}
            category={category}
            level={level}
            onSelectCategory={onSetCategory}
            onSelectLevel={onSetLevel}
          />
        </UITools.Popover>
      </div>
    </div>
  );
};

export default ContrastChecker;
