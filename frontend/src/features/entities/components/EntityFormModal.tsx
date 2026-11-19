'use client';

import { useMemo, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import type { ZodType } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_ENTITY_CATEGORIES,
  ENTITY_STATUSES,
  type EntityStatus,
} from '../schemas/entity.schema';
import {
  extractServerValidationErrors,
  mapZodErrorToFields,
  type EntityFormField,
  type FieldErrorsMap,
} from '../utils/formValidation';
import { EntityCategoryCombobox } from './EntityCategoryCombobox';

export interface EntityFormValues {
  name: string;
  category: string;
  status: EntityStatus;
  latitude: number;
  longitude: number;
}

interface EntityFormModalBodyProps<TOutput> {
  formId: string;
  modalTitle: string;
  sectionTitle: string;
  sectionDescription: string;
  submitLabel: string;
  coordHelperText: string;
  idPrefix: string;
  initialValues: EntityFormValues;
  schema: ZodType<TOutput>;
  categorySuggestions?: string[];
  isSubmitting: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (data: TOutput) => void;
}

const statusItems = ENTITY_STATUSES.map((item) => ({
  label: item,
  value: item,
}));

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

function EntityFormModalBody<TOutput>({
  formId,
  modalTitle,
  sectionTitle,
  sectionDescription,
  submitLabel,
  coordHelperText,
  idPrefix,
  initialValues,
  schema,
  categorySuggestions,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: EntityFormModalBodyProps<TOutput>) {
  const [name, setName] = useState(initialValues.name);
  const [category, setCategory] = useState(initialValues.category);
  const [status, setStatus] = useState<EntityStatus>(initialValues.status);
  const [showCoordDetails, setShowCoordDetails] = useState(false);
  const [latInput, setLatInput] = useState(() => initialValues.latitude.toFixed(6));
  const [lngInput, setLngInput] = useState(() => initialValues.longitude.toFixed(6));
  const [zodFieldErrors, setZodFieldErrors] = useState<FieldErrorsMap>({});
  const [zodFallbackError, setZodFallbackError] = useState<string | null>(null);

  const suggestions = categorySuggestions ?? [...DEFAULT_ENTITY_CATEGORIES];
  const parsedLat = Number(latInput);
  const parsedLng = Number(lngInput);

  const { fieldErrors: backendFieldErrors, generalError: backendGeneralError } =
    useMemo(() => extractServerValidationErrors(serverError), [serverError]);

  const hasZodErrors =
    Object.keys(zodFieldErrors).length > 0 || Boolean(zodFallbackError);

  const activeFieldErrors: FieldErrorsMap = hasZodErrors
    ? zodFieldErrors
    : backendFieldErrors;

  const generalErrorMessage = hasZodErrors
    ? zodFallbackError
    : backendGeneralError;

  const clearFieldError = (field: EntityFormField) => {
    setZodFallbackError(null);
    setZodFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Zod berjalan lebih dulu di frontend
    const parsed = schema.safeParse({
      name,
      category,
      status,
      latitude: parsedLat,
      longitude: parsedLng,
    });

    if (!parsed.success) {
      const mapped = mapZodErrorToFields(parsed.error);
      setZodFieldErrors(mapped);

      if (mapped.latitude || mapped.longitude) {
        setShowCoordDetails(true);
      }

      setZodFallbackError(
        Object.keys(mapped).length === 0
          ? (parsed.error.issues[0]?.message ?? 'Data tidak valid')
          : null,
      );
      return;
    }

    setZodFieldErrors({});
    setZodFallbackError(null);
    onSubmit(parsed.data);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="text-base font-semibold text-foreground">{modalTitle}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
            aria-label={`Tutup ${modalTitle.toLowerCase()}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body Scrollable */}
        <form
          id={formId}
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-5 py-4"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">{sectionTitle}</h3>
            <FieldDescription className="text-xs">{sectionDescription}</FieldDescription>
          </div>

          <FieldGroup className="gap-3.5">
            {/* Nama Entitas */}
            <Field className="gap-1.5">
              <FieldLabel htmlFor={`${idPrefix}-name`} className="text-xs font-medium">
                Nama entitas (wajib diisi)*
              </FieldLabel>
              <Input
                id={`${idPrefix}-name`}
                type="text"
                placeholder="Nama entitas (wajib diisi)*"
                value={name}
                aria-invalid={Boolean(activeFieldErrors.name)}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                className="!h-11 w-full rounded-lg text-sm"
                autoFocus
              />
              <FieldErrorText message={activeFieldErrors.name} />
            </Field>

            {/* Kategori / Label */}
            <Field className="gap-1.5">
              <FieldLabel htmlFor={`${idPrefix}-category`} className="text-xs font-medium">
                Kategori / label (wajib diisi)*
              </FieldLabel>
              <EntityCategoryCombobox
                id={`${idPrefix}-category`}
                value={category}
                suggestions={suggestions}
                onChange={(val) => {
                  setCategory(val);
                  clearFieldError('category');
                }}
              />
              <FieldDescription className="text-[11px]">
                Pilih label dari daftar atau ketik nama baru untuk dibuat otomatis oleh server.
              </FieldDescription>
              <FieldErrorText message={activeFieldErrors.category} />
            </Field>

            {/* Status Operasional */}
            <Field className="gap-1.5">
              <FieldLabel htmlFor={`${idPrefix}-status`} className="text-xs font-medium">
                Status operasional*
              </FieldLabel>
              <Select
                items={statusItems}
                value={status}
                onValueChange={(value) => {
                  if (value) {
                    setStatus(String(value) as EntityStatus);
                    clearFieldError('status');
                  }
                }}
              >
                <SelectTrigger
                  id={`${idPrefix}-status`}
                  aria-invalid={Boolean(activeFieldErrors.status)}
                  className="!h-11 w-full rounded-lg px-3 text-sm"
                >
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent positionerClassName="z-[1300]" className="z-[1300]">
                  <SelectGroup>
                    {statusItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldErrorText message={activeFieldErrors.status} />
            </Field>

            {/* Koordinat */}
            <Field className="gap-1.5">
              <FieldLabel className="text-xs font-medium">Koordinat lokasi</FieldLabel>
              <div className="relative overflow-hidden rounded-xl border bg-muted/40 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-red-500" />
                      <span>
                        {Number.isFinite(parsedLat) ? parsedLat.toFixed(5) : '-'},{' '}
                        {Number.isFinite(parsedLng) ? parsedLng.toFixed(5) : '-'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{coordHelperText}</p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCoordDetails((prev) => !prev)}
                    className="h-8 shrink-0 rounded-full px-3 text-xs font-medium shadow-sm"
                  >
                    Ubah koordinat
                  </Button>
                </div>

                {(showCoordDetails ||
                  Boolean(activeFieldErrors.latitude || activeFieldErrors.longitude)) && (
                  <div className="flex flex-col gap-2">
                    <div className="mt-3 grid grid-cols-2 gap-2.5 border-t pt-3">
                      <Field className="gap-1">
                        <FieldLabel htmlFor={`${idPrefix}-lat`} className="text-[11px]">
                          Latitude
                        </FieldLabel>
                        <Input
                          id={`${idPrefix}-lat`}
                          type="number"
                          step="any"
                          value={latInput}
                          aria-invalid={Boolean(activeFieldErrors.latitude)}
                          onChange={(e) => {
                            setLatInput(e.target.value);
                            clearFieldError('latitude');
                          }}
                          className="h-8 bg-background text-xs"
                        />
                        <FieldErrorText message={activeFieldErrors.latitude} />
                      </Field>
                      <Field className="gap-1">
                        <FieldLabel htmlFor={`${idPrefix}-lng`} className="text-[11px]">
                          Longitude
                        </FieldLabel>
                        <Input
                          id={`${idPrefix}-lng`}
                          type="number"
                          step="any"
                          value={lngInput}
                          aria-invalid={Boolean(activeFieldErrors.longitude)}
                          onChange={(e) => {
                            setLngInput(e.target.value);
                            clearFieldError('longitude');
                          }}
                          className="h-8 bg-background text-xs"
                        />
                        <FieldErrorText message={activeFieldErrors.longitude} />
                      </Field>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sesuaikan nilai latitude & longitude secara manual jika diperlukan
                    </p>
                  </div>
                )}
              </div>
            </Field>

            {/* Hanya tampil jika error bukan berasal dari field mana pun */}
            {generalErrorMessage && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {generalErrorMessage}
              </p>
            )}
          </FieldGroup>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t bg-background px-5 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 text-sm"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting || !name.trim() || !category.trim()}
            className="px-6 text-sm"
          >
            {isSubmitting ? 'Menyimpan...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface EntityFormModalProps<TOutput>
  extends Omit<EntityFormModalBodyProps<TOutput>, 'formId' | 'idPrefix'> {
  resetKey: string;
  formId?: string;
  idPrefix?: string;
}

export function EntityFormModal<TOutput>({
  resetKey,
  formId = 'entity-form',
  idPrefix = 'entity',
  ...rest
}: EntityFormModalProps<TOutput>) {
  return (
    <EntityFormModalBody
      key={resetKey}
      formId={formId}
      idPrefix={idPrefix}
      {...rest}
    />
  );
}
