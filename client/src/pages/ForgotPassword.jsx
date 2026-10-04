import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../api/axios.js';
import { forgotPasswordSchema } from '../lib/validators.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data);
    } catch {
      // Always show neutral message to prevent email enumeration
    } finally {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between p-6 sm:p-12">
      <div className="flex justify-between items-center max-w-md w-full mx-auto">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to sign in</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="max-w-sm w-full mx-auto bg-surface border border-line rounded-xl p-8 shadow-xl/50 my-auto space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-ink tracking-tight">Forgot password?</h1>
          <p className="text-xs text-muted mt-1">
            Enter your account email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-ink font-medium leading-relaxed">
              If that email address is registered on StarShelf, a password reset link has been sent to your inbox.
            </p>
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => setSubmitted(false)}
            >
              Send another link
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              <Mail className="w-4 h-4" />
              <span>Send reset link</span>
            </Button>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-muted">
        StarShelf store rating platform
      </div>
    </div>
  );
}
