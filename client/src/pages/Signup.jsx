import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { signupSchema } from '../lib/validators.js';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Button from '../components/ui/Button.jsx';
import PasswordStrength from '../components/PasswordStrength.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const watchPassword = watch('password', '');
  const watchAddress = watch('address', '');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await api.post('/auth/register', data);
      login(res.data);
      toast.success('Account created successfully');
      navigate('/stores', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check details.';
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
            Create your account and start exploring stores today.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Rate stores, share written feedback, and find the highest rated services in your area.
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

        <div className="max-w-md w-full mx-auto space-y-6 my-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">Create your account</h1>
            <p className="text-xs text-muted mt-1">Fill in your information to get started.</p>
          </div>

          {serverError && (
            <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name (20 to 60 characters)"
              placeholder="e.g. Regular Customer Jane Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <PasswordStrength password={watchPassword} />
            </div>

            <Textarea
              label="Address (up to 400 characters)"
              rows={3}
              maxLength={400}
              value={watchAddress}
              placeholder="Your full address..."
              error={errors.address?.message}
              {...register('address')}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              <UserPlus className="w-4 h-4" />
              <span>Create account</span>
            </Button>
          </form>

          <p className="text-center text-xs text-muted pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-text hover:underline">
              Sign in
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
