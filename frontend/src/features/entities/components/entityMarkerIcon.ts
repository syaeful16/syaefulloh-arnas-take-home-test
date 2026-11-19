import L from 'leaflet';
import { cn } from '@/lib/utils';

export type MarkerVisualState = 'default' | 'matched' | 'dimmed';

export function createEntityMarkerIcon(state: MarkerVisualState): L.DivIcon {
  const colorClass =
    state === 'matched'
      ? 'bg-sky-600 ring-2 ring-sky-300/90 text-white shadow-md'
      : state === 'dimmed'
        ? 'bg-slate-600 ring-1 ring-white/70 text-white/90 shadow-none'
        : 'bg-emerald-600 ring-2 ring-white text-white shadow-md';

  return L.divIcon({
    className: 'custom-entity-pin-wrapper',
    html: `
      <div class="relative flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span class="${cn(
          'flex h-6 w-6 items-center justify-center rounded-full transition-transform',
          colorClass,
        )}">
          <span class="h-2 w-2 rounded-full bg-current"></span>
        </span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -14],
  });
}

export const selectedPositionIcon = L.divIcon({
  className: 'custom-selected-pin-wrapper',
  html: `
    <div class="relative flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <span class="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 ring-2 ring-white shadow-md">
        <span class="h-2 w-2 rounded-full bg-white"></span>
      </span>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  popupAnchor: [0, -14],
});
