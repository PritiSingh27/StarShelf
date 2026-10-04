import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import Button from '../components/ui/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing.');
      return;
    }

    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
        toast.success('Email verified successfully');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between p-6 sm:p-12">
      <div className="flex justify-end max-w-md w-full mx-auto">
        <ThemeToggle />
      </div>

      <div className="max-w-sm w-full mx-auto bg-surface border border-line rounded-xl p-8 shadow-xl/50 my-auto text-center space-y-6">
        {status === 'loading' && (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
            <h1 className="text-lg font-bold text-ink">Verifying your email...</h1>
            <p className="text-xs text-muted">Please wait while we confirm your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-ink">Email verified</h1>
            <p className="text-xs text-muted leading-relaxed">
              Your email address has been verified. You now have full access to rate stores on StarShelf.
            </p>
            <Link to="/stores">
              <Button className="w-full text-xs mt-2">Explore stores</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-ink">Verification failed</h1>
            <p className="text-xs text-danger font-medium">{errorMessage}</p>
            <Link to="/login">
              <Button variant="outline" className="w-full text-xs mt-2">
                Sign in to your account
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-muted">
        StarShelf store rating platform
      </div>
    </div>
  );
}
