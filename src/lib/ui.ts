export function filterBtnCls(active: boolean): string {
  return `px-3.5 py-[5px] rounded-md text-[12px] font-medium cursor-pointer border font-[inherit] transition-colors ${
    active
      ? "bg-brand-muted text-brand border-brand-border"
      : "bg-card text-text2 border-border hover:bg-surface2"
  }`;
}

export const DATE_INPUT_CLS =
  "text-[12px] px-2 py-[5px] rounded-lg border border-border outline-none font-[inherit] text-text1 bg-card focus:border-brand transition-colors";

export const TH_BASE =
  "text-[10px] font-semibold text-text3 uppercase tracking-[0.6px] py-2.5 px-3 border-b border-border whitespace-nowrap cursor-pointer select-none";

export const TD_BASE =
  "py-3 px-3 border-b border-border-light text-[13px] tabular-nums text-right whitespace-nowrap";

export const TD_LEFT =
  "py-3 px-3 border-b border-border-light text-[13px] tabular-nums text-left whitespace-nowrap";
