import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export function ProductDeleteModal({ isOpen, onClose, product, onSuccess }) {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  async function handleDelete() {
    try {
      setIsDeleting(true);
      setError('');
      await api.deleteProduct(product.id);
      toast.success(`Product "${product.name}" deleted successfully.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Product"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-rose-900">Are you sure you want to delete this product?</p>
            <p>
              This will permanently delete <span className="font-bold">{product.name}</span> ({product.sku}) along with all its recorded stock movement history.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        )}

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Current Stock:</span>
            <span className="font-bold text-slate-800">{product.quantity} {product.unit || 'pcs'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Category:</span>
            <span className="text-slate-800">{product.category_name || 'None'}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Product
          </Button>
        </div>
      </div>
    </Modal>
  );
}

