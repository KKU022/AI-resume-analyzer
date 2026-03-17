import toast from 'react-hot-toast';

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 4000,
    icon: '✓',
  });
}

export function showErrorToast(message: string) {
  toast.error(message, {
    duration: 5000,
    icon: 'x',
  });
}

export function showInfoToast(message: string) {
  toast(message, {
    duration: 4000,
    icon: 'i',
  });
}

export function showLoadingToast(message: string) {
  return toast.loading(message);
}

export function dismissToast(toastId: string) {
  toast.remove(toastId);
}

export function updateToast(toastId: string, message: string, type: 'success' | 'error' | 'loading' = 'success') {
  if (type === 'success') {
    toast.success(message, { id: toastId });
  } else if (type === 'error') {
    toast.error(message, { id: toastId });
  }
}
