import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Accordion, Section } from 'shared';

// hooks
import { useFramePresetAccordionItems } from './hooks/useFramePresetAccordionItems';

// others
import { translationNameSpace } from './constants';

const FrameTool: FC = () => {
  const { t } = useTranslation();
  const items = useFramePresetAccordionItems();

  return (
    <Section e2eValue="frame-tool" label={t(`${translationNameSpace}.label`)}>
      <Accordion e2eValue="frame-tool-presets" items={items} />
    </Section>
  );
};

export default FrameTool;
