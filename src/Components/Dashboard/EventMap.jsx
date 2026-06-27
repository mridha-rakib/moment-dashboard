import React, { useState, useRef, useCallback } from 'react';
import { Plus, Minus, Maximize2, Minimize2 } from 'lucide-react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import eventImg from '../../assets/image/event.jpg';
import { appConfig } from '../../shared/config/env';

const CATEGORY_COLORS = {
  "Music": "#A855F7",
  "Nightlife": "#EF4444",
  "Shows & Entertainment": "#E879F9",
  "Food & Drinks": "#F97316",
  "Dining Experiences": "#F59E0B",
  "Food Trucks": "#EA580C",
  "Social Meetups": "#3B82F6",
  "Social Pop-ups": "#06B6D4",
  "Sports & Outdoor": "#22C55E",
  "Games & Leisure": "#14B8A6",
  "Learning & Classes": "#6366F1",
  "Markets & Trade": "#B45309",
  "Street Performances": "#FF007F",
  "Religious & Spiritual": "#C084FC",
  "College Events": "#EAB308",
  "Premium Experiences": "#F5C518",
  "Family & Community": "#84CC16",
  "Other": "#9CA3AF",
};

const getCategoryColor = (category) =>
  (category ? CATEGORY_COLORS[category] : undefined) ?? "#9CA3AF";

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const EventMap = () => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewState, setViewState] = useState({
    latitude: 38.859,
    longitude: -77.051,
    zoom: 15
  });

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.easeTo({
        center: map.getCenter(),
        zoom: map.getZoom() + 1,
        duration: 300
      });
    } else {
      setViewState(prev => ({
        ...prev,
        zoom: Math.min(prev.zoom + 1, 20)
      }));
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.easeTo({
        center: map.getCenter(),
        zoom: Math.max(map.getZoom() - 1, 1),
        duration: 300
      });
    } else {
      setViewState(prev => ({
        ...prev,
        zoom: Math.max(prev.zoom - 1, 1)
      }));
    }
  }, []);

  const handleMarkerClick = useCallback((event) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [event.lng, event.lat],
        zoom: 16,
        duration: 1000,
        essential: true
      });
    }
  }, []);

  const handleToggleMaximize = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(() => {
          setIsMaximized(true);
        });
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else {
        setIsMaximized(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else {
        setIsMaximized(false);
      }
    }
  }, []);

  // Listen to native fullscreen changes to sync React state
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = 
        document.fullscreenElement === containerRef.current || 
        document.webkitFullscreenElement === containerRef.current;
      setIsMaximized(isCurrentlyFullscreen);
      setTimeout(() => {
        mapRef.current?.resize();
      }, 150);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Escape key fallback support for CSS-only fullscreen mode
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMaximized && !document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsMaximized(false);
        setTimeout(() => {
          mapRef.current?.resize();
        }, 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  const events = [
    { id: 1, name: 'Steve Hard', lat: 38.8719, lng: -77.0563, image: eventImg, category: 'Music' },
    { id: 2, name: 'Rooftop Session Vol4.', lat: 38.8680, lng: -77.0420, image: 'https://i.pravatar.cc/150?u=rooftop1', category: 'Nightlife' },
    { id: 3, name: 'Summer Vibes Fest', lat: 38.8655, lng: -77.0585, image: 'https://i.pravatar.cc/150?u=rooftop2', category: 'Shows & Entertainment' },
    { id: 4, name: 'Food & Culture Fair', lat: 38.8633, lng: -77.0494, image: 'https://i.pravatar.cc/150?u=rooftop3', category: 'Food & Drinks' },
    { id: 5, name: 'Social Mixer', lat: 38.8590, lng: -77.0430, image: 'https://i.pravatar.cc/150?u=rooftop4', category: 'Social Meetups' },
    { id: 6, name: 'Outdoor Run Club', lat: 38.8580, lng: -77.0585, image: 'https://i.pravatar.cc/150?u=rooftop5', category: 'Sports & Outdoor' },
    { id: 7, name: 'Street Art Showcase', lat: 38.8530, lng: -77.0490, image: 'https://i.pravatar.cc/150?u=rooftop6', category: 'Street Performances' }
  ];

  const CustomMarker = ({ event }) => {
    const color = getCategoryColor(event.category);
    const glowColor = hexToRgba(color, 1);
    const glowFade = hexToRgba(color, 0.25);

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          handleMarkerClick(event);
        }}
        className="relative group cursor-pointer" 
        style={{ transform: 'translate(-32px, -32px)', width: '250px' }}
      >
        <div className="flex items-center">
          {/* Category Glow */}
          <div
            className="absolute left-[32px] top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: '100px',
              height: '100px',
              background: `radial-gradient(circle, ${glowColor} 0%, ${glowFade} 40%, transparent 70%)`,
              filter: 'blur(14px)',
              mixBlendMode: 'screen',
              zIndex: 0
            }}
          />
          {/* Image */}
          <div
            className="relative z-10 w-16 h-16 rounded-full bg-black overflow-hidden flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110"
            style={{
              border: `3.5px solid ${color}`,
              boxShadow: `0 0 18px 2px ${hexToRgba(color, 0.55)}`
            }}
          >
            <img src={event.image} className="w-full h-full object-cover" alt={event.name} />
          </div>
          {/* Label */}
          <div className="ml-4 z-10">
            <div
              className="text-[14px] font-bold text-white whitespace-nowrap tracking-wide"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.8)' }}
            >
              {event.name}
            </div>
            {event.category && (
              <div className="text-[11px] font-semibold mt-0.5" style={{ color }}>
                {event.category}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden border border-gray-150 dark:border-white/5 shadow-md dark:shadow-2xl group transition-all duration-300 ${
      isMaximized 
        ? "fixed inset-0 z-[120] w-screen h-screen rounded-none bg-slate-900" 
        : "min-h-[600px] rounded-[32px] bg-slate-100 dark:bg-black"
    }`}>
      <Map
        {...viewState}
        ref={mapRef}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={appConfig.mapboxAccessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        logoPosition="bottom-left"
        attributionControl={false}
      >
        {events.map((event) => (
          <Marker key={event.id} latitude={event.lat} longitude={event.lng} anchor="center">
            <CustomMarker event={event} />
          </Marker>
        ))}

        <Marker latitude={38.860} longitude={-77.046} anchor="center">
          <div className="w-11 h-11 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/10 shadow-2xl transition-all hover:scale-110">
            4
          </div>
        </Marker>
      </Map>

      {/* Controls */}
      <button 
        onClick={handleToggleMaximize}
        className="absolute top-6 right-6 p-3.5 bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200/55 dark:border-white/10 rounded-2xl text-gray-705 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-black/90 transition-all duration-300 z-30 shadow-lg dark:shadow-2xl hover:scale-105 active:scale-95"
        title={isMaximized ? "Restore map" : "Maximize map"}
      >
        {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-30">
        <button onClick={handleZoomIn} className="p-3.5 bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200/55 dark:border-white/10 rounded-2xl text-gray-755 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-black/90 transition-all duration-300 shadow-lg dark:shadow-2xl hover:scale-105 active:scale-95">
          <Plus size={18} />
        </button>
        <button onClick={handleZoomOut} className="p-3.5 bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200/55 dark:border-white/10 rounded-2xl text-gray-755 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-black/90 transition-all duration-300 shadow-lg dark:shadow-2xl hover:scale-105 active:scale-95">
          <Minus size={18} />
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/85 dark:bg-black/60 backdrop-blur-md border border-gray-200/55 dark:border-white/10 rounded-full text-[10px] font-extrabold text-gray-755 dark:text-white/70 z-30 tracking-widest shadow-md dark:shadow-2xl">
        {Math.round((viewState.zoom / 20) * 100)}%
      </div>
    </div>
  );
};

export default EventMap;
