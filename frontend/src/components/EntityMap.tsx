'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface Entity {
  id: string;
  name: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
}

// Komponen penangkap event klik peta
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(event) {
      onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export default function EntityMap() {
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: '1',
      name: 'Truk Logistik A01',
      category: 'Vehicle',
      status: 'Active',
      latitude: -6.9175,
      longitude: 107.6191, // Bandung
    },
  ]);

  // State untuk form tambah entitas saat peta diklik
  const [newPosition, setNewPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Vehicle');

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    setNewPosition(latlng);
    setFormName(''); // Reset input
  };

  const handleSaveEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosition || !formName) return;

    const newEntity: Entity = {
      id: Date.now().toString(),
      name: formName,
      category: formCategory,
      status: 'Active',
      latitude: newPosition.lat,
      longitude: newPosition.lng,
    };

    setEntities([...entities, newEntity]);
    setNewPosition(null); // Tutup form
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer center={[-6.9175, 107.6191]} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Listener untuk klik peta */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Render Marker Entitas yang ada */}
        {entities.map((entity) => (
          <Marker key={entity.id} position={[entity.latitude, entity.longitude]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm">{entity.name}</h3>
                <p className="text-xs text-gray-600">Kategori: {entity.category}</p>
                <p className="text-xs text-gray-600">Status: {entity.status}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Lat: {entity.latitude.toFixed(4)}, Lng: {entity.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marker sementara untuk posisi yang baru diklik */}
        {newPosition && (
          <Marker position={[newPosition.lat, newPosition.lng]}>
            <Popup>
              <div className="p-2 w-48">
                <h4 className="font-bold text-xs mb-1 text-blue-600">Tambah Entitas Baru</h4>
                <form onSubmit={handleSaveEntity} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nama Entitas..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-xs p-1 border rounded"
                    autoFocus
                    required
                  />
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs p-1 border rounded"
                  >
                    <option value="Vehicle">Vehicle</option>
                    <option value="IoT Device">IoT Device</option>
                    <option value="Facility">Facility</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700"
                  >
                    Simpan
                  </button>
                </form>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
