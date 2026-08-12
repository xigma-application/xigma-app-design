import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';

// components
import App from 'components/App/App';
import { TooltipProvider } from 'shared';

// others
import { initI18n } from 'translations';

// store
import { store } from 'store';

// styles
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import 'styles/index.scss';

const container = document.getElementById('root')!;

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
