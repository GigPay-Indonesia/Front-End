export type SwapRoutePreference = 'RFQ_ONLY' | 'ALLOW_FALLBACK' | 'FALLBACK_ONLY';

// NOTE:
// The on-chain `preferredRoute` is a uint8. In this codebase/docs it is treated as:
// - 0 = RFQ only
// - 1 = allow fallback (composite)
//
// The contracts/docs do not explicitly define a dedicated "fallback only" value.
// We still expose `FALLBACK_ONLY` at the UI layer and map it to ALLOW_FALLBACK
// so the backend can choose to provide swapData that routes to fallback only.
export const ROUTE_PREFERENCE_UINT8 = {
  RFQ_ONLY: 0,
  ALLOW_FALLBACK: 1,
  FALLBACK_ONLY: 1,
} as const satisfies Record<SwapRoutePreference, number>;

