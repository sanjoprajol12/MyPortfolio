// Utilities
import { focusableChildren } from "../../util/index.js"; // Types
export function useFocusRepair(active, content, fallback) {
  return function repairOrphanedFocus(e) {
    if (!e.relatedTarget && document.activeElement === document.body && active.value) {
      requestAnimationFrame(() => {
        if (!active.value) return;
        const el = content();
        const target = (el && focusableChildren(el)[0]) ?? fallback();
        target?.focus({
          preventScroll: true
        });
      });
      return true;
    }
    return false;
  };
}
//# sourceMappingURL=useFocusRepair.js.map