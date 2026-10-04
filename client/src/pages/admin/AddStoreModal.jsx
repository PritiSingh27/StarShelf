import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import { storeSchema } from '../../lib/validators.js';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';

export default function AddStoreModal({ isOpen, onClose, onSuccess, categories = [] }) {
  const [availableOwners, setAvailableOwners] = useState([]);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(storeSchema),
  });

  const watchAddress = watch('address', '');

  useEffect(() => {
    if (isOpen) {
      api.get('/admin/owners/available')
        .then((res) => setAvailableOwners(res.data))
        .catch(() => setAvailableOwners([]));
    }
  }, [isOpen]);

  const onSubmit = async (data) => {
    setServerError('');
    const payload = {
      name: data.name,
      email: data.email,
      address: data.address,
      categoryId: Number(data.categoryId),
      ownerId: data.ownerId ? Number(data.ownerId) : null,
    };

    try {
      await api.post('/admin/stores', payload);
      toast.success('Store created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('email', { message: 'Store email is already in use.' });
      } else {
        setServerError(err.response?.data?.message || 'Failed to create store.');
      }
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const ownerOptions = [
    { value: '', label: 'None (Unassigned owner)' },
    ...availableOwners.map((o) => ({ value: o.id, label: `${o.name} (${o.email})` })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Store">
      {serverError && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium mb-4">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Store name (3 to 100 characters)"
          placeholder="e.g. Alice Coffee & Bakery"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Store email address"
          type="email"
          placeholder="contact@store.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Textarea
          label="Store address (up to 400 characters)"
          rows={2}
          maxLength={400}
          value={watchAddress}
          placeholder="Physical store address..."
          error={errors.address?.message}
          {...register('address')}
        />

        <Select
          label="Category"
          error={errors.categoryId?.message}
          options={categoryOptions}
          {...register('categoryId')}
        />

        <Select
          label="Assign store owner (optional)"
          error={errors.ownerId?.message}
          options={ownerOptions}
          {...register('ownerId')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add store
          </Button>
        </div>
      </form>
    </Modal>
  );
}
