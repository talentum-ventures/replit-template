import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import '@talentum-ventures/convex-datatable/styles.css';
import './index.css';
import { ConvexApp } from './ConvexApp';
import { DemoApp } from './DemoApp';

const convexUrl = import.meta.env.VITE_CONVEX_URL?.trim();
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

const root = createRoot(rootElement);

if (convexUrl) {
  const convex = new ConvexReactClient(convexUrl);

  root.render(
    <StrictMode>
      <ConvexAuthProvider client={convex}>
        <ConvexApp />
      </ConvexAuthProvider>
    </StrictMode>
  );
} else {
  root.render(
    <StrictMode>
      <DemoApp />
    </StrictMode>
  );
}
