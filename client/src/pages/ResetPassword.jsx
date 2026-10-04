import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import { resetPasswordSchema } from '../lib/validators.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import PasswordStrength from '../components/PasswordStrength.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchNewPassword = watch('newPassword', '');

  const onSubmit = async (data) => {
    setServerError('');
    if (!token) {
      setServerError('Reset token is missing or invalid.');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      toast.success('Password reset successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed. Token may be expired.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between p-6 sm:p-12">
      <div className="flex justify-end max-w-md w-full mx-auto">
        <ThemeToggle />
      </div>

      <div className="max-w-sm w-full mx-auto bg-surface border border-line rounded-xl p-8 shadow-xl/50 my-auto space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink tracking-tight">Reset your password</h1>
          <p className="text-xs text-muted mt-1">Enter your new secure password below.</p>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium">
            {serverError}
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-ink font-medium leading-relaxed">
              Your password has been updated. You can now sign in with your new credentials.
            </p>
            <Button
              className="w-full text-xs"
              onClick={() => navigate('/login')}
            >
              Sign in now
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="New password"
                type="password"
                placeholder="••••••••"
                error={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <PasswordStrength password={watchNewPassword} />
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              <KeyRound className="w-4 h-4" />
              <span>Save new password</span>
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-xs font-semibold text-brand-text hover:underline">
            Return to sign in
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-muted">
        StarShelf store rating platform
      </div>
    </div>
  );
}
