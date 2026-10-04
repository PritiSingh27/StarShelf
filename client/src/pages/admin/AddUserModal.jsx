import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import { userAdminSchema } from '../../lib/validators.js';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import PasswordStrength from '../../components/PasswordStrength.jsx';

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userAdminSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const watchPassword = watch('password', '');
  const watchAddress = watch('address', '');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await api.post('/admin/users', data);
      toast.success('User created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('email', { message: 'Email address is already in use.' });
      } else {
        setServerError(err.response?.data?.message || 'Failed to create user.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
      {serverError && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium mb-4">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name (20 to 60 characters)"
          placeholder="e.g. System Administrator Account"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="user@starshelf.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Initial password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrength password={watchPassword} />
        </div>

        <Textarea
          label="Address (up to 400 characters)"
          rows={2}
          maxLength={400}
          value={watchAddress}
          placeholder="Physical address..."
          error={errors.address?.message}
          {...register('address')}
        />

        <Select
          label="Role"
          error={errors.role?.message}
          options={[
            { value: 'USER', label: 'Normal User' },
            { value: 'OWNER', label: 'Store Owner' },
            { value: 'ADMIN', label: 'System Administrator' },
          ]}
          {...register('role')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add user
          </Button>
        </div>
      </form>
    </Modal>
  );
}
