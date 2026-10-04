import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import { categorySchema } from '../../lib/validators.js';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

export default function AddCategoryModal({ isOpen, onClose, onSuccess }) {
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await api.post('/admin/categories', data);
      toast.success('Category created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('name', { message: 'A category with this name already exists.' });
      } else {
        setServerError(err.response?.data?.message || 'Failed to create category.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Store Category">
      {serverError && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger font-medium mb-4">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Category name (2 to 50 characters)"
          placeholder="e.g. Bookstore, Pharmacy..."
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add category
          </Button>
        </div>
      </form>
    </Modal>
  );
}
