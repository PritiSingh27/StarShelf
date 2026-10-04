import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, KeyRound, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { profileUpdateSchema, changePasswordSchema } from '../lib/validators.js';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import PasswordStrength from '../components/PasswordStrength.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';

export default function Profile() {
  const { user, setUser, refetchUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    watch: watchProfile,
    setError: setProfileFieldError,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    watch: watchPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const watchAddress = watchProfile('address', user?.address || '');
  const watchNewPassword = watchPasswordForm('newPassword', '');

  const onUpdateProfile = async (data) => {
    setProfileError('');
    try {
      const res = await api.put('/profile', data);
      setUser((prev) => ({ ...prev, ...res.data }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
      await refetchUser();
    } catch (err) {
      if (err.response?.status === 409) {
        setProfileFieldError('email', { message: 'Email address is already in use by another account.' });
      } else {
        setProfileError(err.response?.data?.message || 'Failed to update profile.');
      }
    }
  };

  const handleCancelEdit = () => {
    resetProfile({
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
    });
    setProfileError('');
    setIsEditing(false);
  };

  const onChangePassword = async (data) => {
    setPasswordError('');
    try {
      await api.put('/profile/password', data);
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    }
  };

  const roleVariant = user?.role === 'ADMIN' ? 'admin' : user?.role === 'OWNER' ? 'owner' : 'user';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Account Settings"
        description="Manage your profile information, address, and password."
      />

      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-soft text-brand-text">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Personal Information</h2>
              <p className="text-xs text-muted">Your public identity and contact details.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={roleVariant}>{user?.role}</Badge>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit profile</span>
              </Button>
            )}
          </div>
        </div>

        {profileError && (
          <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium mb-4">
            {profileError}
          </div>
        )}

        <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
          <Input
            label="Full name (20 to 60 characters)"
            disabled={!isEditing}
            error={profileErrors.name?.message}
            {...registerProfile('name')}
          />

          <Input
            label="Email address"
            type="email"
            disabled={!isEditing}
            error={profileErrors.email?.message}
            {...registerProfile('email')}
          />

          <Textarea
            label="Address (up to 400 characters)"
            rows={3}
            maxLength={400}
            value={watchAddress}
            disabled={!isEditing}
            error={profileErrors.address?.message}
            {...registerProfile('address')}
          />

          {isEditing && (
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" isLoading={isSubmittingProfile}>
                <Save className="w-4 h-4" />
                <span>Save changes</span>
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-3 pb-4 border-b border-line mb-6">
          <div className="p-2.5 rounded-xl bg-brand-soft text-brand-text">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-ink">Security & Password</h2>
            <p className="text-xs text-muted">Update your password to keep your account secure.</p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium mb-4">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4 max-w-md">
          <Input
            label="Current password"
            type="password"
            placeholder="••••••••"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />

          <div>
            <Input
              label="New password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword')}
            />
            <PasswordStrength password={watchNewPassword} />
          </div>

          <Button type="submit" isLoading={isSubmittingPassword} className="mt-2">
            <Save className="w-4 h-4" />
            <span>Update password</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
