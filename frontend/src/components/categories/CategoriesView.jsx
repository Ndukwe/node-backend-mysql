import React from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Package,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export function CategoriesView({
  categories = [],
  isLoading,
  onOpenCategoryModal,
  onOpenDeleteModal,
  onFilterByCat,
}) {
  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Product Categories</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Group products into taxonomy classes for better reporting and inventory tracking.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => onOpenCategoryModal(null)}
          className="self-start sm:self-auto"
        >
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FolderTree className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No categories created yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Categories help you organize products, filter inventory reports, and manage your warehouse.
            </p>
            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => onOpenCategoryModal(null)}
              className="mt-4"
            >
              Create First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <Card
              key={c.id}
              className="hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <FolderTree className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: #{c.id}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenCategoryModal(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenDeleteModal(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 line-clamp-2 min-h-[32px]">
                  {c.description || <span className="italic text-slate-400">No description provided</span>}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Created {formatDate(c.created_at)}
                  </span>
                  <Badge variant="primary" size="sm">
                    <Package className="w-3 h-3" />
                    {c.product_count || 0} Products
                  </Badge>
                </div>
              </div>

              {/* Card Footer action: View products */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onFilterByCat(c.id)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 group"
                >
                  <span>View products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

