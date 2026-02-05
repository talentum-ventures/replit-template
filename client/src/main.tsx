import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

async function main() {
  const root = createRoot(document.getElementById("root")!);
  
  if (!convexUrl) {
    const { default: DemoApp } = await import("./App");
    root.render(
      <StrictMode>
        <DemoApp />
      </StrictMode>
    );
  } else {
    const { ConvexAuthProvider } = await import("@convex-dev/auth/react");
    const { ConvexReactClient } = await import("convex/react");
    const { ConvexApp } = await import("./ConvexApp");
    
    const convex = new ConvexReactClient(convexUrl);
    
    root.render(
      <StrictMode>
        <ConvexAuthProvider client={convex}>
          <ConvexApp />
        </ConvexAuthProvider>
      </StrictMode>
    );
  }
}

main();
