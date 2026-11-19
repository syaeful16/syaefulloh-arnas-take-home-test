'use client';

import {
  ENTITY_STATUSES,
  getEntityCategoryName,
  updateEntitySchema,
  type CreateEntityInput,
  type Entity,
  type EntityStatus,
  type UpdateEntityInput,
} from '../schemas/entity.schema';
import { EntityFormModal } from './EntityFormModal';

interface EntityEditModalProps {
  entity: Entity;
  categorySuggestions?: string[];
  isSubmitting: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (data: UpdateEntityInput) => void;
}

function normalizeStatus(rawStatus: string): EntityStatus {
  return ENTITY_STATUSES.includes(rawStatus as EntityStatus)
    ? (rawStatus as EntityStatus)
    : 'Active';
}

export function EntityEditModal({
  entity,
  categorySuggestions,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: EntityEditModalProps) {
  const editSchema = updateEntitySchema.omit({ id: true });

  const handleEditSubmit = (values: CreateEntityInput) => {
    onSubmit({
      id: entity.id,
      ...values,
    });
  };

  return (
    <EntityFormModal<CreateEntityInput>
      resetKey={entity.id}
      formId="edit-entity-form"
      idPrefix="edit-entity"
      modalTitle="Edit entitas"
      sectionTitle="Perbarui detail entitas"
      sectionDescription="Ubah nama, label kategori, status operasional, atau koordinat entitas."
      submitLabel="Simpan perubahan"
      coordHelperText="Klik tombol di samping untuk menyesuaikan latitude & longitude."
      initialValues={{
        name: entity.name,
        category: getEntityCategoryName(entity.category),
        status: normalizeStatus(entity.status),
        latitude: entity.latitude,
        longitude: entity.longitude,
      }}
      schema={editSchema}
      categorySuggestions={categorySuggestions}
      isSubmitting={isSubmitting}
      serverError={serverError}
      onClose={onClose}
      onSubmit={handleEditSubmit}
    />
  );
}
