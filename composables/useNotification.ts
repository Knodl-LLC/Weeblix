import { ElMessage, ElNotification } from 'element-plus'
import type { MessageOptions, NotificationOptions } from 'element-plus'

export const useNotification = () => {
  const showMessage = (options: MessageOptions | string) => {
    if (typeof options === 'string') {
      ElMessage({ message: options })
    } else {
      ElMessage(options)
    }
  }

  const showSuccess = (message: string) => {
    ElMessage.success(message)
  }

  const showError = (message: string) => {
    ElMessage.error(message)
  }

  const showWarning = (message: string) => {
    ElMessage.warning(message)
  }

  const showInfo = (message: string) => {
    ElMessage.info(message)
  }

  const showNotification = (options: NotificationOptions) => {
    ElNotification(options)
  }

  const showSuccessNotification = (title: string, message: string) => {
    ElNotification.success({
      title,
      message,
    })
  }

  const showErrorNotification = (title: string, message: string) => {
    ElNotification.error({
      title,
      message,
    })
  }

  const showWarningNotification = (title: string, message: string) => {
    ElNotification.warning({
      title,
      message,
    })
  }

  const showInfoNotification = (title: string, message: string) => {
    ElNotification.info({
      title,
      message,
    })
  }

  return {
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
  }
}
