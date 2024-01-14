import { ContestType,  } from "@prisma/client";
import { create } from "zustand";

export type ModalType = "createContest";
// interface ModalData {
//   server?: Server;
//   channel?: Channel;
//   channelType?: ChannelType;
//   apiUrl?: string;
//   query?: Record<string, any>;
// }

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  onOpen: (type, ) => set({ isOpen: true, type }),
  onClose: () => set({ type: null, isOpen: false })
}));