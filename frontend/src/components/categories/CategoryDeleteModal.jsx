import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export function CategoryDeleteModal({ isOpen, onClose, category, onSuccess }) {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!category) return null;

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setError('');
      await api.deleteCategory(category.id);
      toast.success(`Category "${category.name}" deleted.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Category"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-900">
              Are you sure you want to delete category "{category.name}"?
            </p>
            <p>
              Any products assigned to this category will have their category cleared (set to Uncategorized). Products themselves will NOT be deleted.
            </p>
          </div>
        </div>

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        {category.product_count > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <span className="font-semibold">{category.product_count} products</span> currently reference this category.
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Delete Category
          </Button>
        </div>
      </div>
    </Modal>
  );
}

