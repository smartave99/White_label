// Global declaration file (no top-level imports/exports)

declare module "@vercel/speed-insights/next" {
    import * as React from 'react';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const SpeedInsights: React.ComponentType<any>;
}

// We removed the manual lucide-react declaration to avoid shadowing the real types.
// Instead, we use path mapping in tsconfig.json to help the IDE.
