export type ConfirmationBypassEvent = {
  shiftKey: boolean;
};

export const confirmAction = (message: string, event?: ConfirmationBypassEvent) => {
  if (event?.shiftKey) {
    return true;
  }

  return confirm(message);
};
