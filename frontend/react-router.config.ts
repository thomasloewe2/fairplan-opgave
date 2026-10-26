import type { Config } from "@react-router/dev/config";

// This admin client fetches from the .NET API in the browser, not during SSR.
export default { ssr: false } satisfies Config;
