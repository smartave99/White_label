import * as React from 'react';

declare module "@vercel/speed-insights/next" {
    export const SpeedInsights: React.ComponentType<any>;
}

// Help IDE resolve lucide-react if it's struggling with subpaths or cached types
declare module "lucide-react" {
    export * from "lucide-react/dist/lucide-react";
}
