import { MapContainer, Marker, TileLayer, Popup, useMap, GeoJSON } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { blueIcon, greenIcon } from '@/static/markers'
import type { Camera, Sighting, GeoArea } from '@/static/types'

const laBounds: LatLngBoundsExpression = [
    [33.0, -120.0],
    [35.0, -116.5],
];

function MarkerPopup({ marker, setSidebarMode, crds }: { marker: Camera | Sighting, setSidebarMode: React.Dispatch<React.SetStateAction<string | null>>, crds: [number, number] }) {
    const map = useMap();
    let title = '';
    let mode = '';
    if ('site' in marker) {
        title = marker.site
        mode = `Camera-${marker.camera_id}-${marker.date}`
    } else {
        title = marker.title
        mode = `Sighting-${marker.observer}-${marker.species}-${marker.date}`
    }

    return (
        <Popup>
            <div>
                <button
                    onClick={() => {
                        setSidebarMode(mode)
                        // push view reset to end of call stack to defer default pan behavior
                        setTimeout(() => {
                            map.setView(crds, map.getZoom());
                        }, 0);
                    }}
                    className="text-center w-full hover:cursor-pointer">
                    {title}
                </button>
            </div>
        </Popup>
    );
}

const MapComponent = ({ cameras, sightings, geoAreas, setSidebarMode }: { cameras: Camera[], sightings: Sighting[], geoAreas: GeoArea[], setSidebarMode: React.Dispatch<React.SetStateAction<string | null>> }) => (
    <MapContainer
        center={[34, -118]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        maxBounds={laBounds}
        maxBoundsViscosity={1.0}
        minZoom={8}
    >
        <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"
        />

        {[...cameras, ...sightings].map((marker) => {
            const isCamera = "camera_id" in marker;

            let lat: number, lon: number;
            if (marker.crds.startsWith("{")) {
                const parsed = JSON.parse(marker.crds);
                lat = parsed.lat;
                lon = parsed.lon;
            } else {
                const crds = marker.crds.split(',');
                lat = parseFloat(crds[0]);
                lon = parseFloat(crds[1]);
            }

            const key = isCamera
                ? `${marker.camera_id}-${marker.date}`
                : `${marker.observer}-${marker.species}-${marker.date}`;

            const icon = isCamera ? blueIcon : greenIcon;

            return (
                <Marker
                    key={key}
                    position={[lat, lon]}
                    icon={icon}
                >
                    {isCamera ? (
                        <MarkerPopup
                            marker={marker as Camera}
                            setSidebarMode={setSidebarMode}
                            crds={[lat, lon]}
                        />
                    ) : (
                        <MarkerPopup
                            marker={marker as Sighting}
                            setSidebarMode={setSidebarMode}
                            crds={[lat, lon]}
                        />
                    )}
                </Marker>
            );
        })}

        {geoAreas.map((area) => (
            <GeoJSON
                key={area.name}
                data={area.geom}
                style={{ color: '#ffbd3b', weight: 2, fillOpacity: 0.3 }}
                onEachFeature={(_, layer) => {
                    const polygonLayer = layer as L.Polygon;
                    const center = polygonLayer.getBounds().getCenter();

                    layer.bindPopup(
                        `<button id="popup-btn" class="text-center w-full hover:cursor-pointer">${area.name}</button>`
                    );

                    layer.on('popupopen', (e) => {
                        const btn = document.getElementById('popup-btn');
                        if (btn) {
                            btn.onclick = () => {
                                setSidebarMode(`Area-${area.name}`);
                                e.target._map.setView(center, e.target._map.getZoom());
                            };
                        }
                    });
                }}
            />
        ))}

    </MapContainer>
);

export default MapComponent;
