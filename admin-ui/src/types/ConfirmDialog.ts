type ConfirmDialogOptions = {
  message: string
  button: { no: string; yes: string }
  callback: (btn: boolean) => void | Promise<void>
}

export type ConfirmDialog = (options: ConfirmDialogOptions) => void