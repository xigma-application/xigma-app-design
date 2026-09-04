import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// hooks
import { useFramePresetAccordionItems } from './hooks/useFramePresetAccordionItems';

// others
import { translationNameSpace } from './constants';

// styles
import styles from './frame-tool.module.scss';

const FrameTool: FC = () => {
  const { t } = useTranslation();
  const items = useFramePresetAccordionItems();

  return (
    <UITools.Section e2eValue="frame-tool" label={t(`${translationNameSpace}.label`)} separator={false}>
      <UITools.Accordion className={styles.FrameTool__accordion} e2eValue="frame-tool-presets" items={items} />
    </UITools.Section>
  );
};

export default FrameTool;
