import { SVGCSSIcon, SVGCSSStatefulIcon } from "./types.js";
/**
 * Change class names in icon
 *
 * Optionally change IDs in icon if idsCallback is provided
 */
declare function changeSVGCSSIconClassnames<T extends SVGCSSStatefulIcon | SVGCSSIcon>(icon: T, callback: (value: string) => string, idsCallback?: (id: string, content: string, tagName: string) => string): T;
export { changeSVGCSSIconClassnames };