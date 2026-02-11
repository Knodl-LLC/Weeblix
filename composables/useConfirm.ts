import { ElMessageBox } from 'element-plus'
import type { ElMessageBoxOptions } from 'element-plus'

export const useConfirm = () => {
  const confirm = async (
    message: string,
    title: string = 'Подтверждение',
    options?: ElMessageBoxOptions
  ): Promise<boolean> => {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: 'Да',
        cancelButtonText: 'Отмена',
        type: 'warning',
        ...options,
      })
      return true
    } catch {
      return false
    }
  }

  const confirmDelete = async (itemName?: string): Promise<boolean> => {
    const message = itemName
      ? `Вы уверены, что хотите удалить "${itemName}"?`
      : 'Вы уверены, что хотите удалить этот элемент?'

    return confirm(message, 'Подтверждение удаления', {
      type: 'error',
      confirmButtonText: 'Удалить',
    })
  }

  const confirmAction = async (
    action: string,
    itemName?: string
  ): Promise<boolean> => {
    const message = itemName
      ? `Вы уверены, что хотите ${action} "${itemName}"?`
      : `Вы уверены, что хотите ${action}?`

    return confirm(message, 'Подтверждение действия')
  }

  const prompt = async (
    message: string,
    title: string = 'Ввод данных',
    options?: ElMessageBoxOptions
  ): Promise<string | null> => {
    try {
      const { value } = await ElMessageBox.prompt(message, title, {
        confirmButtonText: 'OK',
        cancelButtonText: 'Отмена',
        ...options,
      })
      return value
    } catch {
      return null
    }
  }

  return {
    confirm,
    confirmDelete,
    confirmAction,
    prompt,
  }
}
