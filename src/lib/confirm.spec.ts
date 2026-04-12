import { afterEach, describe, expect, it, vi } from "vitest";

import { confirmAction } from "./confirm";

describe("confirmAction", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("bypasses confirmation when shift is held", () => {
    const confirmSpy = vi.fn<typeof confirm>(() => false);
    vi.stubGlobal("confirm", confirmSpy);

    expect(confirmAction("Delete?", { shiftKey: true })).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("uses confirm when shift is not held", () => {
    const confirmSpy = vi.fn<typeof confirm>(() => true);
    vi.stubGlobal("confirm", confirmSpy);

    expect(confirmAction("Delete?", { shiftKey: false })).toBe(true);
    expect(confirmSpy).toHaveBeenCalledWith("Delete?");
  });
});
