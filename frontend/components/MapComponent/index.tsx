import dynamic from 'next/dynamic';

{/* Leaflet maps can only render in the browser */ }
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
});

export { MapComponent };
