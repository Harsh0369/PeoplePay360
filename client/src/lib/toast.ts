import toast from 'react-hot-toast';

// Themed, consistent toasts used across the app in place of inline banners.
const base = { style: { fontSize: '13px', borderRadius: '12px', padding: '10px 14px' }, duration: 3500 };

export const notify = {
  success: (msg: string) =>
    toast.success(msg, { ...base, iconTheme: { primary: '#10B981', secondary: '#fff' } }),
  error: (msg: string) =>
    toast.error(msg || 'Something went wrong', { ...base, duration: 4500 }),
  info: (msg: string) => toast(msg, base),
  loading: (msg: string) => toast.loading(msg, base),
  dismiss: (id?: string) => toast.dismiss(id),
};

export default notify;
