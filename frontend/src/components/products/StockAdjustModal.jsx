import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ArrowDownLeft, ArrowUpRight, Sliders, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

const REASON_PRESETS = {
  in: ['Purchase Order', 'Supplier Delivery', 'Customer Return', 'Stock Transfer In', 'Production Batch'],
  out: ['Customer Order / Sale', 'Damaged / Broken', 'Expired Product', 'Stock Transfer Out', 'Sample / Promotion'],
  adjustment: ['Periodic Inventory Count', 'Audit Correction', 'System Discrepancy Reconciliation'],
};

export function StockAdjustModal({
  isOpen,
  onClose,
  product,
  allProducts = [],
  onSuccess,
}) {
  const toast = useToast();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Selected product object
  const currentProduct = product || allProducts.find((p) => p.id === Number(selectedProductId));

  useEffect(() => {
    if (product) {
      setSelectedProductId(product.id);
    } else if (allProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(allProducts[0].id);
    }
  }, [product, allProducts]);

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setReason('');
      setReference('');
      setError('');
    }
  }, [isOpen]);

  const currentStock = currentProduct ? Number(currentProduct.quantity) : 0;
  const numQty = Number(quantity) || 0;

  let calculatedStock = currentStock;
  if (movementType === 'in') {
    calculatedStock = currentStock + numQty;
  } else if (movementType === 'out') {
    calculatedStock = currentStock - numQty;
  } else if (movementType === 'adjustment') {
    calculatedStock = numQty;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const targetId = product ? product.id : Number(selectedProductId);
    if (!targetId) {
      setError('Please select a product.');
      return;
    }

    if (quantity === '' || isNaN(numQty)) {
      setError('Please provide a valid quantity.');
      return;
    }

    if ((movementType === 'in' || movementType === 'out') && numQty <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }

    if (movementType === 'adjustment' && numQty < 0) {
      setError('Adjusted quantity cannot be negative.');
      return;
    }

    if (movementType === 'out' && numQty > currentStock) {
      setError(`Cannot stock out ${numQty} items. Only ${currentStock} available in stock.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await api.adjustStock({
        product_id: targetId,
        movement_type: movementType,
        quantity: numQty,
        reason: reason.trim() || null,
        reference: reference.trim() || null,
      });

      toast.success(
        `Stock successfully ${
          movementType === 'in' ? 'added' : movementType === 'out' ? 'removed' : 'adjusted'
        } for ${currentProduct ? currentProduct.name : 'product'}.`
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Stock Inventory"
      subtitle="Record stock entries, departures, or audit count adjustments."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Product Selection if not predefined */}
        {!product ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current: {p.quantity} {p.unit || 'pcs'}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
              <p className="text-sm font-semibold text-slate-900">{product.name}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Current Stock</span>
              <span className="text-base font-bold text-slate-900">
                {product.quantity} {product.unit || 'pcs'}
              </span>
            </div>
          </div>
        )}

        {/* Movement Type Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Movement Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMovementType('in')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                movementType === 'in'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              Stock In (+)
            </button>
            <button
              type="button"
              onClick={() => setMovementType('out')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                movementType === 'out'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm ring-1 ring-rose-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              Stock Out (-)
            </button>
            <button
              type="button"
              onClick={() => setMovementType('adjustment')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                movementType === 'adjustment'
                  ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-sm ring-1 ring-purple-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-600" />
              Adjustment (=)
            </button>
          </div>
        </div>

        {/* Quantity Input & Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {movementType === 'adjustment' ? 'New Exact Quantity *' : 'Quantity Units *'}
            </label>
            <input
              type="number"
              min={movementType === 'adjustment' ? 0 : 1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 25"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Real-time Calculation Badge */}
          <div className="flex flex-col justify-end">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block">Stock After Operation:</span>
              <span
                className={`text-base font-bold ${
                  calculatedStock < 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {calculatedStock} {currentProduct?.unit || 'pcs'}
                {movementType !== 'adjustment' && numQty > 0 && (
                  <span
                    className={`ml-1.5 text-xs font-normal ${
                      movementType === 'in' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    ({movementType === 'in' ? '+' : '-'}
                    {numQty})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Reason Presets & Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason / Notes
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {REASON_PRESETS[movementType]?.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setReason(preset)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Received shipment from supplier"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Reference / Document # */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Reference / Document Number (Optional)
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. PO-8924, INV-1004, AUDIT-2026-1"
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={movementType === 'out' ? 'danger' : 'primary'}
            isLoading={isSubmitting}
          >
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

