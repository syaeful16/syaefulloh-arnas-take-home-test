'use client';

import {
  createEntitySchema,
  type CreateEntityInput,
} from '../schemas/entity.schema';
import { EntityFormModal } from './EntityFormModal';

interface EntityCreateModalProps {
  position: { lat: number; lng: number };
  categorySuggestions?: string[];
  isSubmitting: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (data: CreateEntityInput) => void;
}

export function EntityCreateModal({
  position,
  categorySuggestions,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: EntityCreateModalProps) {
  return (
    <EntityFormModal<CreateEntityInput>
      resetKey={`${position.lat}-${position.lng}`}
      formId="create-entity-form"
      idPrefix="create-entity"
      modalTitle="Tambahkan entitas"
      sectionTitle="Detail entitas"
      sectionDescription="Masukkan informasi entitas geografis pada titik lokasi yang dipilih di peta."
      submitLabel="Simpan"
      coordHelperText="Tutup modal untuk mengklik titik lain pada peta."
      initialValues={{
        name: '',
        category: '',
        status: 'Active',
        latitude: position.lat,
        longitude: position.lng,
      }}
      schema={createEntitySchema}
      categorySuggestions={categorySuggestions}
      isSubmitting={isSubmitting}
      serverError={serverError}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
