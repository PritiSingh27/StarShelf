import { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './ui/Button.jsx';

export default function VerifyBanner() {
  const { user, emailVerificationRequired } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified || !emailVerificationRequired) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await api.post('/auth/resend-verification');
      setSent(true);
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs py-2 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Verify your email to start rating stores.</span>
        </div>
        {sent ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sent
          </span>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            isLoading={sending}
            onClick={handleResend}
            className="py-1 px-2.5 text-xs bg-amber-200/50 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100"
          >
            Resend email
          </Button>
        )}
      </div>
    </div>
  );
}
