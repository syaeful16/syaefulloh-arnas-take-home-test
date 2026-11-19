'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type L from 'leaflet';
import { cn } from '@/lib/utils';
import {
  getEntityCategoryName,
  type CreateEntityInput,
  type Entity,
  type UpdateEntityInput,
} from '../schemas/entity.schema';
import {
  useCategoriesQuery,
  useCreateEntityMutation,
  useDeleteEntityMutation,
  useEntitiesQuery,
  useUpdateEntityMutation,
} from '../hooks/useEntities';
import { useUrlEntityFilters } from '../hooks/useUrlEntityFilters';
import { EntityCreateModal } from './EntityCreateModal';
import { EntityDeleteModal } from './EntityDeleteModal';
import { EntityEditModal } from './EntityEditModal';
import { EntityMarkerPopup } from './EntityMarkerPopup';
import { EntitySearchFilterBar } from './EntitySearchFilterBar';
import { MapHintCallout } from './MapHintCallout';
import {
  createEntityMarkerIcon,
  selectedPositionIcon,
  type MarkerVisualState,
} from './entityMarkerIcon';

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function MapFocusController({
  focusEntity,
  onRegisterMap,
}: {
  focusEntity: Entity | null;
  onRegisterMap: (map: L.Map) => void;
}) {
  const map = useMap();

  useEffect(() => {
    onRegisterMap(map);
  }, [map, onRegisterMap]);

  useEffect(() => {
    if (!focusEntity) return;
    const lat = Number(focusEntity.latitude);
    const lng = Number(focusEntity.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    map.setView([lat, lng], Math.max(map.getZoom(), 15), {
      animate: true,
    });
  }, [focusEntity, map]);

  return null;
}

export function EntityMap() {
  const {
    rawFilters,
    setRawFilters,
    normalizedFilters,
    isDebouncing,
    hasActiveFilter,
  } = useUrlEntityFilters();

  // Ambil seluruh entitas agar semua marker tetap tampil di peta
  const { data: entities = [], isLoading, isError, error } = useEntitiesQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const createMutation = useCreateEntityMutation();
  const updateMutation = useUpdateEntityMutation();
  const deleteMutation = useDeleteEntityMutation();

  const { reset: resetCreateMutation } = createMutation;
  const { reset: resetUpdateMutation } = updateMutation;
  const { reset: resetDeleteMutation } = deleteMutation;

  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [deletingEntity, setDeletingEntity] = useState<Entity | null>(null);
  const [focusedEntity, setFocusedEntity] = useState<Entity | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const validEntities = useMemo(
    () =>
      entities
        .map((item) => ({
          ...item,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
        }))
        .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)),
    [entities],
  );

  const matchedEntities = useMemo(() => {
    const query = (normalizedFilters.search ?? '').trim().toLowerCase();
    const categoryFilter = (normalizedFilters.category ?? '').trim().toLowerCase();
    const statusFilter = (normalizedFilters.status ?? '').trim().toLowerCase();

    return validEntities.filter((entity) => {
      if (query && !entity.name.toLowerCase().includes(query)) {
        return false;
      }
      if (
        categoryFilter &&
        getEntityCategoryName(entity.category).toLowerCase() !== categoryFilter
      ) {
        return false;
      }
      if (statusFilter && entity.status.toLowerCase() !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [validEntities, normalizedFilters]);

  const matchedIds = useMemo(
    () => new Set(matchedEntities.map((entity) => entity.id)),
    [matchedEntities],
  );

  const markerIcons = useMemo(
    () => ({
      default: createEntityMarkerIcon('default'),
      matched: createEntityMarkerIcon('matched'),
      dimmed: createEntityMarkerIcon('dimmed'),
    }),
    [],
  );

  const categorySuggestions = useMemo(
    () => categories.map((item) => item.name.trim()).filter(Boolean),
    [categories],
  );

  const handleRegisterMap = useCallback((instance: L.Map) => {
    mapInstanceRef.current = instance;
  }, []);

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    if (editingEntity || deletingEntity) return;
    resetCreateMutation();
    setSelectedPosition(latlng);
  };

  const handleOpenEdit = useCallback(
    (target: Entity) => {
      resetUpdateMutation();
      resetDeleteMutation();
      setSelectedPosition(null);
      setDeletingEntity(null);
      setEditingEntity(target);
    },
    [resetUpdateMutation, resetDeleteMutation],
  );

  const handleOpenDelete = useCallback(
    (target: Entity) => {
      resetDeleteMutation();
      resetUpdateMutation();
      setSelectedPosition(null);
      setEditingEntity(null);
      setDeletingEntity(target);
    },
    [resetDeleteMutation, resetUpdateMutation],
  );

  const handleSelectFromList = useCallback((entity: Entity) => {
    setFocusedEntity({ ...entity });
  }, []);

  const handleSaveEntity = (data: CreateEntityInput) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setSelectedPosition(null);
      },
    });
  };

  const handleUpdateEntity = (data: UpdateEntityInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setEditingEntity(null);
      },
    });
  };

  const handleConfirmDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeletingEntity(null);
      },
    });
  };

  return (
    <div className="relative h-full w-full">
      <EntitySearchFilterBar
        filters={rawFilters}
        categories={categorySuggestions}
        entities={matchedEntities}
        totalCount={validEntities.length}
        hasActiveFilter={hasActiveFilter}
        isLoading={isLoading}
        isDebouncing={isDebouncing}
        onChangeFilters={setRawFilters}
        onSelectEntity={handleSelectFromList}
        onEditEntity={handleOpenEdit}
        onDeleteEntity={handleOpenDelete}
      />

      <MapHintCallout />

      {isError && (
        <div className="pointer-events-auto absolute top-16 right-4 z-[1000] max-w-xs rounded-xl border border-red-200 bg-red-50/95 px-3.5 py-2 text-xs text-red-700 shadow-lg backdrop-blur-md">
          {(error as Error).message}
        </div>
      )}

      <MapContainer
        center={[-6.9175, 107.6191]}
        zoom={13}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={handleMapClick} />
        <MapFocusController focusEntity={focusedEntity} onRegisterMap={handleRegisterMap} />

        {validEntities.map((entity) => {
          const isMatched = matchedIds.has(entity.id);
          const visualState: MarkerVisualState = hasActiveFilter
            ? isMatched
              ? 'matched'
              : 'dimmed'
            : 'default';

          return (
            <Marker
              key={entity.id}
              position={[entity.latitude, entity.longitude]}
              icon={markerIcons[visualState]}
              opacity={visualState === 'dimmed' ? 0.55 : 1}
              zIndexOffset={visualState === 'matched' ? 500 : 0}
            >
              <Tooltip
                permanent
                direction="top"
                offset={[0, -14]}
                className={cn(
                  'entity-name-tooltip',
                  visualState === 'dimmed' && 'entity-name-tooltip-dimmed',
                )}
              >
                {entity.name}
              </Tooltip>

              <Popup closeButton={true} maxWidth={280}>
                <EntityMarkerPopup
                  entity={entity}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              </Popup>
            </Marker>
          );
        })}

        {selectedPosition && (
          <Marker
            position={[selectedPosition.lat, selectedPosition.lng]}
            icon={selectedPositionIcon}
          >
            <Popup>
              <div className="text-xs font-medium">
                Titik terpilih: {selectedPosition.lat.toFixed(4)},{' '}
                {selectedPosition.lng.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {selectedPosition && (
        <EntityCreateModal
          position={selectedPosition}
          categorySuggestions={categorySuggestions}
          isSubmitting={createMutation.isPending}
          serverError={
            createMutation.isError ? (createMutation.error as Error).message : null
          }
          onClose={() => {
            resetCreateMutation();
            setSelectedPosition(null);
          }}
          onSubmit={handleSaveEntity}
        />
      )}

      {editingEntity && (
        <EntityEditModal
          entity={editingEntity}
          categorySuggestions={categorySuggestions}
          isSubmitting={updateMutation.isPending}
          serverError={
            updateMutation.isError ? (updateMutation.error as Error).message : null
          }
          onClose={() => {
            resetUpdateMutation();
            setEditingEntity(null);
          }}
          onSubmit={handleUpdateEntity}
        />
      )}

      {deletingEntity && (
        <EntityDeleteModal
          entity={deletingEntity}
          isDeleting={deleteMutation.isPending}
          serverError={
            deleteMutation.isError ? (deleteMutation.error as Error).message : null
          }
          onClose={() => {
            resetDeleteMutation();
            setDeletingEntity(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
