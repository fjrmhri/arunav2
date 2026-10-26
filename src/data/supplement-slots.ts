import type { Supplement } from "@/types";

type Slot = Supplement["timingSlot"];

export const SLOT_ORDER: readonly Slot[] = ["pagi", "siang", "sore", "malam"];

export const SLOT_LABEL: Record<Slot, string> = {
  pagi: "Pagi",
  siang: "Siang",
  sore: "Sore",
  malam: "Malam",
};

export const SLOT_TIME: Record<Slot, string> = {
  pagi: "07:00–08:30",
  siang: "12:00–13:00",
  sore: "16:00–17:00",
  malam: "21:00–21:30",
};
