import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import { useAuth, getRoleDefaultPath } from '../context/AuthContext.jsx';
import { loginSchema } from '../lib/validators.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);
      login(res.data);
      toast.success('Signed in successfully');
      const from = location.state?.from?.pathname || getRoleDefaultPath(res.data.role);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brand/90 via-brand to-brand-strong text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span>StarShelf</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-3xl font-extrabold leading-tight">
            Discover and rate your favorite stores in one place.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Join thousands of users rating local businesses, sharing reviews, and discovering top-rated places.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          &copy; StarShelf. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 bg-surface">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="max-w-sm w-full mx-auto space-y-6 my-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">Sign in to your account</h1>
            <p className="text-xs text-muted mt-1">Enter your credentials to access your dashboard.</p>
          </div>

          {serverError && (
            <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-ink">Password</span>
                <Link to="/forgot-password" className="text-xs font-medium text-brand-text hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted pt-2">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-text hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-muted">
          StarShelf store rating platform
        </div>
      </div>
    </div>
  );
}
