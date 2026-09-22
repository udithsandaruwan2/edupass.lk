/** @deprecated Use domain types + services/api — kept for any leftover imports. */
export type { Seminar } from "@/domain/types";
export { formatLkr as lkr } from "@/services/api";
export { createSeedStore } from "@/data/seed";

import { getStore, hydrateStore } from "@/mocks/store";

hydrateStore();
export const seminars = getStore().seminars;
