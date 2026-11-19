'use client';

import { MapPin, Pencil, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getEntityCategoryName, type Entity } from '../schemas/entity.schema';
import { cn } from '@/lib/utils';

interface EntityMarkerPopupProps {
  entity: Entity;
  onEdit: (entity: Entity) => void;
  onDelete: (entity: Entity) => void;
}

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-emerald-500/12 text-emerald-700 border-emerald-500/25';
    case 'maintenance':
      return 'bg-amber-500/12 text-amber-700 border-amber-500/25';
    default:
      return 'bg-slate-500/12 text-slate-700 border-slate-500/25';
  }
}

export function EntityMarkerPopup({
  entity,
  onEdit,
  onDelete,
}: EntityMarkerPopupProps) {
  const categoryName = getEntityCategoryName(entity.category);

  return (
    <div className="w-60 select-none">
      {/* Header: Judul + Badge Status */}
      <div className="flex items-start justify-between gap-2 pr-5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {entity.name}
        </h3>
        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-tight',
            getStatusBadgeClass(entity.status),
          )}
        >
          {entity.status}
        </span>
      </div>

      {/* Metadata: Kategori & Koordinat */}
      <div className="mt-2.5 space-y-1.5 border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 shrink-0 text-primary/80" />
          <span className="truncate font-medium text-foreground/85">{categoryName}</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span className="truncate">
            {entity.latitude.toFixed(4)}, {entity.longitude.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Aksi */}
      <div className="mt-3 flex items-center gap-2 pt-0.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onEdit(entity)}
          className="h-8 flex-1 gap-1 rounded-lg text-xs font-medium shadow-none hover:bg-accent"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onDelete(entity)}
          className="h-8 flex-1 gap-1 rounded-lg border-destructive/30 text-xs font-medium text-destructive shadow-none hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Hapus
        </Button>
      </div>
    </div>
  );
}
