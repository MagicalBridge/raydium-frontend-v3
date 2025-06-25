import { memo } from 'react'
import { DialogTypes } from '@/constants/dialogs'
import { useDialogsStore } from '@/store/useDialogsStore'
import { InitialBuyDialog } from '@/components/Dialogs/InitialBuyDialog'
import { AddCommentDialog } from '@/components/Dialogs/AddCommentDialog'
import { ThirdPartyWarningDialog } from '@/components/Dialogs/ThirdPartyWarningDialog'
import { TradeBoxDialog } from '@/components/Dialogs/TradeBoxDialog'
import { VestingEditDialog } from '@/components/Dialogs/VestingDialogs/VestingEditDialog'
import { CurvePreviewDialog } from '@/components/Dialogs/CurvePreviewDialog'

export const DialogManager = memo(() => {
  const openDialog = useDialogsStore((s) => s.openDialog)
  const closeDialog = useDialogsStore((s) => s.closeDialog)
  const activeDialog = useDialogsStore((state) => state.activeDialog)
  if (!activeDialog) return null

  const modalProps = {
    setIsOpen: (isOpen: boolean) => {
      isOpen ? openDialog(activeDialog) : closeDialog()
    }
  }

  return DialogTypes.match(activeDialog, {
    InitialBuy: (args) => <InitialBuyDialog {...args} {...modalProps} />,
    AddComment: (args) => <AddCommentDialog {...args} {...modalProps} />,
    ThirdPartyWarning: (args) => <ThirdPartyWarningDialog {...args} {...modalProps} />,
    TradeBox: (args) => <TradeBoxDialog {...args} {...modalProps} />,
    VestingEdit: (args) => <VestingEditDialog {...args} {...modalProps} />,
    CurvePreview: (args) => <CurvePreviewDialog {...args} {...modalProps} />,
    default: () => null
  })
})
