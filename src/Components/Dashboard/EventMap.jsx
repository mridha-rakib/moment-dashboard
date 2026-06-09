import React, { useState, useRef, useCallback } from 'react';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import eventImg from '../../assets/image/event.jpg';
import { appConfig } from '../../shared/config/env';

const EventMap = () => {
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({
    latitude: 38.859,
    longitude: -77.051,
    zoom: 15
  });

  const handleZoomIn = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 20)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 1)
    }));
  }, []);

  const events = [
    { id: 1, name: 'Steve Hard', lat: 38.8719, lng: -77.0563, image: eventImg, color: 'rgba(255, 100, 0, 1)', border: '#FF6400' },
    { id: 2, name: 'Rooftop Session Vol4.', lat: 38.8680, lng: -77.0420, image: 'https://i.pravatar.cc/150?u=rooftop1', color: 'rgba(168, 85, 247, 1)', border: '#A855F7' },
    { id: 3, name: 'Rooftop Session Vol4.', lat: 38.8655, lng: -77.0585, image: 'https://i.pravatar.cc/150?u=rooftop2', color: 'rgba(168, 85, 247, 1)', border: '#A855F7' },
    { id: 4, name: 'Rooftop Session Vol4.', lat: 38.8633, lng: -77.0494, image: 'https://i.pravatar.cc/150?u=rooftop3', color: 'rgba(255, 255, 255, 1)', border: '#FFFFFF' },
    { id: 5, name: 'Rooftop Session Vol4.', lat: 38.8590, lng: -77.0430, image: 'https://i.pravatar.cc/150?u=rooftop4', color: 'rgba(168, 85, 247, 1)', border: '#A855F7' },
    { id: 6, name: 'Rooftop Session Vol4.', lat: 38.8580, lng: -77.0585, image: 'https://i.pravatar.cc/150?u=rooftop5', color: 'rgba(168, 85, 247, 1)', border: '#A855F7' },
    { id: 7, name: 'Rooftop Session Vol4.', lat: 38.8530, lng: -77.0490, image: 'https://i.pravatar.cc/150?u=rooftop6', color: 'rgba(168, 85, 247, 1)', border: '#A855F7' }
  ];

  const neighborhoodLabels = [
    { name: 'PENTAGON CITY', lat: 38.8670, lng: -77.0520 },
    { name: 'VIRGINIA HIGHLANDS', lat: 38.8630, lng: -77.0580 },
    { name: 'ADDISON HEIGHTS', lat: 38.8610, lng: -77.0550 },
    { name: 'CRYSTAL CITY', lat: 38.8580, lng: -77.0490 },
    { name: 'NATIONAL LANDING', lat: 38.8540, lng: -77.0470 },
  ];

  const streetLabels = [
    { name: 'S Hayes St', lat: 38.8655, lng: -77.0535, rotate: true },
    { name: 'National Ave', lat: 38.8580, lng: -77.0440, rotate: true },
    { name: '22nd St S', lat: 38.8635, lng: -77.0515 },
    { name: '23rd St S', lat: 38.8615, lng: -77.0515 },
    { name: '24th St S', lat: 38.8595, lng: -77.0515 },
    { name: '25th St S', lat: 38.8575, lng: -77.0515 },
  ];

  const CustomMarker = ({ event }) => (
    <div className="relative group cursor-pointer" style={{ transform: 'translate(-32px, -32px)', width: '250px' }}>
      <div className="flex items-center">
        {/* Neon Glow */}
        <div
          className="absolute left-[32px] top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, ${event.color} 0%, ${event.color.replace('1)', '0.3)')} 40%, transparent 70%)`,
            filter: 'blur(15px)',
            mixBlendMode: 'screen',
            zIndex: 0
          }}
        />
        {/* Image */}
        <div
          className="relative z-10 w-16 h-16 rounded-full border-[3.5px] bg-black overflow-hidden flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110"
          style={{ borderColor: event.border }}
        >
          <img src={event.image} className="w-full h-full object-cover" alt={event.name} />
        </div>
        {/* Label */}
        <div className="ml-4 z-10">
          <div className="text-[14px] font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)] whitespace-nowrap tracking-wide" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
            {event.name}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#282626] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl group">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={appConfig.mapboxAccessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        logoPosition="bottom-left"
        attributionControl={false}
      >
        {neighborhoodLabels.map((label, idx) => (
          <Marker key={`n-${idx}`} latitude={label.lat} longitude={label.lng}>
            <div className="text-[14px] font-bold text-white/10 uppercase tracking-[0.3em] pointer-events-none select-none text-center" style={{ transform: 'translate(0, -50%)' }}>
              {label.name}
            </div>
          </Marker>
        ))}
        
        {streetLabels.map((label, idx) => (
          <Marker key={`s-${idx}`} latitude={label.lat} longitude={label.lng}>
            <div className="text-[11px] font-bold text-white/5 uppercase tracking-[0.15em] pointer-events-none select-none" style={{ transform: `translate(0, -50%) ${label.rotate ? 'rotate(90deg)' : ''}` }}>
              {label.name}
            </div>
          </Marker>
        ))}

        {events.map((event) => (
          <Marker key={event.id} latitude={event.lat} longitude={event.lng} anchor="center">
            <CustomMarker event={event} />
          </Marker>
        ))}

        <Marker latitude={38.860} longitude={-77.046} anchor="center">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/10 shadow-2xl transition-all hover:scale-110">
            4
          </div>
        </Marker>
      </Map>

      {/* Controls */}
      <button className="absolute top-8 right-8 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[22px] text-white/80 hover:text-white hover:bg-black/80 transition-all z-30 shadow-2xl active:scale-95">
        <Maximize2 size={20} />
      </button>
      
      <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-30">
        <button onClick={handleZoomIn} className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[22px] text-white/80 hover:text-white hover:bg-black/80 transition-all shadow-2xl active:scale-95">
          <Plus size={20} />
        </button>
        <button onClick={handleZoomOut} className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-[22px] text-white/80 hover:text-white hover:bg-black/80 transition-all shadow-2xl active:scale-95">
          <Minus size={20} />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-5 py-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full text-[11px] font-black text-white/70 z-30 tracking-widest shadow-2xl">
        {Math.round((viewState.zoom / 20) * 100)}%
      </div>
    </div>
  );
};

export default EventMap;
