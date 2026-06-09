import React from 'react';
import { MapPin, ChevronDown, Maximize2 } from 'lucide-react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { appConfig } from '../../shared/config/env';

const EventDetails = () => {
  const [isActionOpen, setIsActionOpen] = React.useState(false);

  const event = {
    title: 'Rooftop Session Vol.4',
    about: 'An unforgettable rooftop experience featuring the best in house and techno. Doors open at 8pm. Dress code smart casual.',
    venue: 'The Rooftop Lounge',
    address: '123 Main Street, New York, NY 1001',
    banner: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop',
    position: [40.7128, -74.0060],
    locationNotes: [
      'Use back entrance after 10PM',
      'Parking available at adjacent garage - $20 flat rate',
      'Nearest subway 7th Ave Station'
    ],
    additionalInfo: [
      'Use back entrance after 10PM',
      'Parking available at adjacent garage - $20 flat rate',
      'Nearest subway 7th Ave Station'
    ]
  };

  const CustomMarker = () => (
    <div className="relative group cursor-pointer" style={{ transform: 'translate(-20px, -20px)', width: '180px' }}>
      <div className="flex items-center">
        {/* Neon Glow */}
        <div
          className="absolute left-[20px] top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: '80px',
            height: '80px',
            background: `radial-gradient(circle, rgba(168, 85, 247, 1) 0%, rgba(168, 85, 247, 0.3) 40%, transparent 70%)`,
            filter: 'blur(12px)',
            mixBlendMode: 'screen',
            zIndex: 0
          }}
        />
        {/* Image */}
        <div className="relative z-10 w-10 h-10 rounded-full border-2 border-[#A855F7] bg-black overflow-hidden flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110">
          <img src={event.banner} className="w-full h-full object-cover" alt={event.title} />
        </div>
        {/* Label */}
        <div className="ml-3 z-10">
          <div className="text-[10px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] whitespace-nowrap tracking-wide">
            {event.title}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#13131F] p-8 transition-colors duration-300">

      <style>
        {`
          .map-tiles {
            filter: grayscale(100%) brightness(3) contrast(5) !important;
            opacity: 0.7 !important;
          }
          .leaflet-container {
            background: #0A0A0A !important;
          }
          .leaflet-marker-icon {
            background: none !important;
            border: none !important;
          }
        `}
      </style>

      <div className="mx-auto max-w-[1400px]">
        <div className="w-full h-[320px] rounded-[32px] overflow-hidden mb-10 shadow-lg">
          <img src={event.banner} alt="Event Banner" className="object-cover w-full h-full" />
        </div>

        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1A1A4B] dark:text-white transition-colors">About</h2>
          <div className="relative">
            <button
              onClick={() => setIsActionOpen(!isActionOpen)}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 transition-all bg-white dark:bg-[#1E1E2D] border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg hover:bg-gray-50 dark:hover:bg-[#2D2D3F]"
            >
              Action <ChevronDown size={14} className={`transition-transform ${isActionOpen ? 'rotate-180' : ''}`} />
            </button>
            {isActionOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-30 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-colors">Suspend </button>

              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1 space-y-10">
            <div className="relative">
              <p className="text-sm text-[#4B4B4B] dark:text-gray-400 font-medium leading-relaxed mb-4 transition-colors">
                {event.about}
              </p>

              <span className="px-3 py-1 bg-red-50 dark:bg-red-900/10 text-red-500 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-red-100 dark:border-red-900/20">
                18+ only
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#1A1A4B] dark:text-white transition-colors">
                <MapPin size={18} />
                <h2 className="text-lg font-bold">New York City</h2>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium"><span className="text-gray-400 font-bold uppercase text-[10px] mr-2">Venue:</span> <span className="text-[#1A1A4B] dark:text-white">{event.venue}</span></p>
                <p className="text-sm font-medium"><span className="text-gray-400 font-bold uppercase text-[10px] mr-2">Address:</span> <span className="text-[#1A1A4B] dark:text-white">{event.address}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1A1A4B] dark:text-white transition-colors">Location</h2>
              <ul className="space-y-1">
                {event.locationNotes.map((note, index) => (
                  <li key={index} className="text-sm font-medium text-gray-500 transition-colors tracking-tight">
                    -{note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1A1A4B] dark:text-white transition-colors">Additional Info</h2>
              <ul className="space-y-1">
                {event.additionalInfo.map((note, index) => (
                  <li key={index} className="text-sm font-medium text-gray-500 transition-colors tracking-tight">
                    -{note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:w-[420px]">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#1A1A4B] dark:text-white transition-colors">Location</h2>
              <div className="relative h-[280px] rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 group transition-colors">
                <Map
                  initialViewState={{
                    latitude: event.position[0],
                    longitude: event.position[1],
                    zoom: 15
                  }}
                  mapboxAccessToken={appConfig.mapboxAccessToken}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/dark-v11"
                  attributionControl={false}
                >
                  <Marker latitude={event.position[0]} longitude={event.position[1]} anchor="center">
                    <CustomMarker />
                  </Marker>
                </Map>

                <button className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-black/60 transition-all z-10 shadow-lg">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default EventDetails;
