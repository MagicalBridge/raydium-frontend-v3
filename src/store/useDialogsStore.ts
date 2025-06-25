import createStore from './createStore'
import type { DialogType } from '@/constants/dialogs'

export interface DialogsState {
  activeDialog?: DialogType
  dialogQueue: DialogType[]
  openDialog: (dialog: DialogType) => void
  closeDialog: () => void
  forceOpenDialog: (dialog: DialogType) => void
}

const initialState = {
  activeDialog: undefined,
  dialogQueue: []
}

export const useDialogsStore = createStore<DialogsState>((set) => ({
  ...initialState,
  openDialog: (dialog) =>
    set((state) => {
      if (state.activeDialog?.type === dialog.type) return state

      return {
        ...state,
        activeDialog: state.activeDialog ? state.activeDialog : dialog,
        dialogQueue: state.activeDialog ? [...state.dialogQueue, dialog] : state.dialogQueue
      }
    }),
  closeDialog: () =>
    set((state) => {
      const [nextDialog, ...remainingDialogs] = state.dialogQueue
      return {
        ...state,
        activeDialog: nextDialog,
        dialogQueue: remainingDialogs
      }
    }),
  forceOpenDialog: (dialog) =>
    set((state) => ({
      ...state,
      dialogQueue: state.activeDialog ? [state.activeDialog, ...state.dialogQueue] : state.dialogQueue,
      activeDialog: dialog
    }))
}))
