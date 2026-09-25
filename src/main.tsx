import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';

// @xigma
import { TooltipProvider } from '@xigma/core';

// components
import App from 'components/App/App';

// others
import { initI18n } from 'translations';

// store
import { store } from 'store';

// utils
import { registerGlobalUtils } from 'utils/refs/registerGlobalUtils';

// styles
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@xigma/components/index.css';
import 'styles/index.scss';

const container = document.getElementById('root')!;

registerGlobalUtils();

initI18n().then(() => {
  createRoot(container).render(
    <StrictMode>
      <Provider store={store}>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </Provider>
    </StrictMode>,
  );
});
