'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  MoreVertical,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ENTITY_STATUSES,
  getEntityCategoryName,
  type Entity,
  type EntityFilters,
  type EntityStatus,
} from '../schemas/entity.schema';
import { cn } from '@/lib/utils';

interface EntitySearchFilterBarProps {
  filters: EntityFilters;
  categories: string[];
  entities: Entity[];
  totalCount?: number;
  hasActiveFilter?: boolean;
  isLoading?: boolean;
  isDebouncing?: boolean;
  onChangeFilters: (next: EntityFilters) => void;
  onSelectEntity: (entity: Entity) => void;
  onEditEntity: (entity: Entity) => void;
  onDeleteEntity: (entity: Entity) => void;
}

const ALL_CATEGORIES_VALUE = '__all__';
const ALL_STATUSES_VALUE = '__all__';

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

function EntityListSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-36 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
          <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface EntityRowActionMenuProps {
  entity: Entity;
  onEdit: (entity: Entity) => void;
  onDelete: (entity: Entity) => void;
}

function EntityRowActionMenu({
  entity,
  onEdit,
  onDelete,
}: EntityRowActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleCloseOnScrollOrResize = () => setOpen(false);
    window.addEventListener('scroll', handleCloseOnScrollOrResize, true);
    window.addEventListener('resize', handleCloseOnScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleCloseOnScrollOrResize, true);
      window.removeEventListener('resize', handleCloseOnScrollOrResize);
    };
  }, [open]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (open) {
      setOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuWidth = 144; // w-36
    const menuHeight = 84;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 12 && rect.top > menuHeight + 12;

    const top = openUpward
      ? Math.max(12, rect.top - menuHeight - 4)
      : Math.min(viewportHeight - menuHeight - 12, rect.bottom + 4);

    const left = Math.min(
      Math.max(12, rect.right - menuWidth),
      viewportWidth - menuWidth - 12,
    );

    setMenuPos({ top, left });
    setOpen(true);
  };

  return (
    <div className="shrink-0">
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Opsi aksi untuk ${entity.name}`}
        title="Opsi lainnya"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {open &&
        menuPos &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[1350]"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            />
            <div
              role="menu"
              style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
              className="fixed z-[1400] w-36 rounded-xl border bg-popover p-1 text-popover-foreground shadow-xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onEdit(entity);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onDelete(entity);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

export function EntitySearchFilterBar({
  filters,
  categories,
  entities,
  totalCount,
  hasActiveFilter = false,
  isLoading = false,
  isDebouncing = false,
  onChangeFilters,
  onSelectEntity,
  onEditEntity,
  onDeleteEntity,
}: EntitySearchFilterBarProps) {
  const [listExpanded, setListExpanded] = useState(true);

  const searchValue = filters.search ?? '';
  const selectedCategory = filters.category ?? '';
  const selectedStatus = filters.status ?? '';

  const hasFilterControlsActive = Boolean(
    searchValue.trim() || selectedCategory || selectedStatus || hasActiveFilter,
  );

  const showSkeleton = isLoading || isDebouncing;

  const categorySelectItems = [
    { label: 'Semua kategori', value: ALL_CATEGORIES_VALUE },
    ...categories.map((cat) => ({ label: cat, value: cat })),
  ];

  const statusSelectItems = [
    { label: 'Semua status', value: ALL_STATUSES_VALUE },
    ...ENTITY_STATUSES.map((st) => ({ label: st, value: st })),
  ];

  const handleReset = () => {
    onChangeFilters({
      search: '',
      category: '',
      status: '',
    });
  };

  return (
    <div className="pointer-events-auto absolute top-4 left-4 z-[1000] flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-background/98 shadow-xl backdrop-blur-md">
      {/* Bagian Atas Ala Google Maps: Search Input + Filter Category & Status */}
      <div className="space-y-2.5 border-b p-3">
        {/* Search Row */}
        <div className="flex items-center gap-2 rounded-xl border bg-muted/35 px-3 py-1 focus-within:border-ring focus-within:bg-background">
          <Input
            type="text"
            value={searchValue}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                search: e.target.value,
              })
            }
            placeholder="Telusuri entitas peta"
            className="h-8 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            aria-label="Telusuri entitas peta"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                onChangeFilters({
                  ...filters,
                  search: '',
                })
              }
              className="h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>

        {/* Filter Row: Kategori & Status */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Select
              items={categorySelectItems}
              value={selectedCategory || ALL_CATEGORIES_VALUE}
              onValueChange={(val) => {
                if (!val) return;
                onChangeFilters({
                  ...filters,
                  category: val === ALL_CATEGORIES_VALUE ? '' : String(val),
                });
              }}
            >
              <SelectTrigger className="!h-9 w-full rounded-lg border bg-background px-2.5 text-xs font-medium">
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent positionerClassName="z-[1300]" className="z-[1300]">
                <SelectGroup>
                  {categorySelectItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-32 shrink-0">
            <Select
              items={statusSelectItems}
              value={selectedStatus || ALL_STATUSES_VALUE}
              onValueChange={(val) => {
                if (!val) return;
                onChangeFilters({
                  ...filters,
                  status:
                    val === ALL_STATUSES_VALUE ? '' : (String(val) as EntityStatus),
                });
              }}
            >
              <SelectTrigger className="!h-9 w-full rounded-lg border bg-background px-2.5 text-xs font-medium">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent positionerClassName="z-[1300]" className="z-[1300]">
                <SelectGroup>
                  {statusSelectItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {hasFilterControlsActive && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Reset filter"
              title="Reset filter"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Header Ringkasan & Toggle Daftar */}
      <button
        type="button"
        onClick={() => setListExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-2 text-left transition-colors hover:bg-muted/40"
      >
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {showSkeleton
            ? 'Memuat daftar entitas...'
            : hasActiveFilter && typeof totalCount === 'number'
              ? `${entities.length} dari ${totalCount} entitas cocok`
              : `${entities.length} entitas`}
        </span>
        {listExpanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Daftar Entitas Ala Google Maps + Menu Titik Tiga */}
      {listExpanded && (
        <div className="flex-1 overflow-y-auto border-t pb-12">
          {showSkeleton ? (
            <EntityListSkeleton />
          ) : entities.length === 0 ? (
            <div className="px-4 py-7 text-center text-xs text-muted-foreground">
              Tidak ada entitas yang ditemukan.
            </div>
          ) : (
            <div className="divide-y">
              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className="group flex items-center justify-between gap-2 px-4 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <button
                    type="button"
                    onClick={() => onSelectEntity(entity)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500/12 text-sky-700">
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-foreground">
                          {entity.name}
                        </p>
                        <span
                          className={cn(
                            'shrink-0 rounded-full border px-1.5 py-0.2 text-[10px] font-medium',
                            getStatusBadgeClass(entity.status),
                          )}
                        >
                          {entity.status}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {getEntityCategoryName(entity.category)}
                      </p>
                      <p className="truncate font-mono text-[11px] text-muted-foreground/80">
                        {entity.latitude.toFixed(4)}, {entity.longitude.toFixed(4)}
                      </p>
                    </div>
                  </button>

                  <EntityRowActionMenu
                    entity={entity}
                    onEdit={onEditEntity}
                    onDelete={onDeleteEntity}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
