import { FC } from 'react';

// components
import FillSection from '../FillSection/FillSection';
import StrokeSettingsRow from './StrokeSettingsRow/StrokeSettingsRow';

export const StrokeSection: FC = () => <FillSection footer={<StrokeSettingsRow />} property="strokes" />;

export default StrokeSection;
