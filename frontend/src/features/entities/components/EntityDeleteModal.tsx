'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEntityCategoryName, type Entity } from '../schemas/entity.schema';

interface EntityDeleteModalProps {
  entity: Entity;
  isDeleting: boolean;
  serverError: string | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function EntityDeleteModal({
  entity,
  isDeleting,
  serverError,
  onClose,
  onConfirm,
}: EntityDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h2 className="text-base font-semibold text-foreground">Hapus entitas</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isDeleting}
            className="h-8 w-8 rounded-full"
            aria-label="Tutup modal hapus"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-3 px-5 py-4 text-xs">
          <p className="leading-relaxed text-muted-foreground">
            Apakah kamu yakin ingin menghapus entitas berikut dari peta? Tindakan ini tidak
            dapat dibatalkan.
          </p>

          <div className="space-y-1 rounded-xl border bg-muted/40 p-3">
            <p className="text-sm font-semibold text-foreground">{entity.name}</p>
            <p className="text-muted-foreground">
              Kategori: <span className="font-medium text-foreground/85">{getEntityCategoryName(entity.category)}</span>
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {entity.latitude.toFixed(5)}, {entity.longitude.toFixed(5)}
            </p>
          </div>

          {serverError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 font-medium text-destructive">
              {serverError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t bg-background px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full px-5 text-sm"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(entity.id)}
            disabled={isDeleting}
            className="rounded-full px-6 text-sm"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>
    </div>
  );
}
