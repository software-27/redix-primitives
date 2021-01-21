/**
 * This type is included in the DOM lib but is deprecated. It's still quite useful, so we want to
 * include it here and reference it when possible to avoid any issues when updating TS.
 */
export type ElementTagNameMap = HTMLElementTagNameMap &
  Pick<SVGElementTagNameMap, Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>>;

export type Merge<P1 = {}, P2 = {}> = Omit<P1, keyof P2> & P2;
