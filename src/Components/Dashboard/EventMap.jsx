import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, MapPin, Maximize2, Minimize2, Minus, Plus, RotateCw } from 'lucide-react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { dashboardService } from '../../features/dashboard';
import { appConfig } from '../../shared/config/env';

const CATEGORY_COLORS = {
  'Music': '#A855F7',
  'Nightlife': '#EF4444',
  'Shows & Entertainment': '#E879F9',
  'Food & Drinks': '#F97316',
  'Dining Experiences': '#F59E0B',
  'Food Trucks': '#EA580C',
  'Social Meetups': '#3B82F6',
  'Social Pop-ups': '#06B6D4',
  'Sports & Outdoor': '#22C55E',
  'Games & Leisure': '#14B8A6',
  'Learning & Classes': '#6366F1',
  'Markets & Trade': '#B45309',
  'Street Performances': '#FF007F',
  'Religious & Spiritual': '#C084FC',
  'College Events': '#EAB308',
  'Premium Experiences': '#F5C518',
  'Family & Community': '#84CC16',
  'Other': '#9CA3AF',
};

const STATUS_LABELS = {
  upcoming: 'Upcoming',
  live: 'Live',
  active: 'Active',
};

const getCategoryColor = (category) => CATEGORY_COLORS[category] ?? '#9CA3AF';

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const formatStartTime = (value) => {
  if (!value) return 'Start time unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Start time unavailable';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const EventDetails = ({ event }) => (
  <div className="min-w-[220px] max-w-[280px] p-1 text-slate-900">
    <div className="flex items-start gap-3">
      {event.bannerImageUrl ? (
        <img className="h-12 w-12 shrink-0 rounded-xl object-cover" src={event.bannerImageUrl} alt="" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <CalendarDays size={21} />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold">{event.title}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-indigo-600">
          {STATUS_LABELS[event.status] ?? 'Active'}
        </p>
      </div>
    </div>
    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
      <p>{formatStartTime(event.scheduledAt)}</p>
      <p className="flex items-start gap-1.5"><MapPin size={13} className="mt-0.5 shrink-0" />{event.locationName}</p>
      {event.hostName && <p>Hosted by {event.hostName}</p>}
    </div>
  </div>
);

const EventMap = () => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const hasFittedEvents = useRef(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [viewState, setViewState] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 1.5,
  });

  const loadEvents = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setIsLoading(true);
    try {
      const nextEvents = await dashboardService.listMapEvents();
      setEvents(nextEvents);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load active events.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents({ showLoading: true });
    const refreshTimer = window.setInterval(() => loadEvents(), 60_000);
    const handleFocus = () => loadEvents();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadEvents]);

  useEffect(() => {
    if (events.length === 0 || hasFittedEvents.current || !mapRef.current) return;
    hasFittedEvents.current = true;

    if (events.length === 1) {
      mapRef.current.flyTo({
        center: [events[0].longitude, events[0].latitude],
        zoom: 12,
        duration: 700,
      });
      return;
    }

    const bounds = events.reduce(
      (currentBounds, event) => [
        [Math.min(currentBounds[0][0], event.longitude), Math.min(currentBounds[0][1], event.latitude)],
        [Math.max(currentBounds[1][0], event.longitude), Math.max(currentBounds[1][1], event.latitude)],
      ],
      [[events[0].longitude, events[0].latitude], [events[0].longitude, events[0].latitude]],
    );
    mapRef.current.fitBounds(bounds, { padding: 55, maxZoom: 13, duration: 700 });
  }, [events]);

  const activeEvent = useMemo(() => {
    const activeId = selectedEventId ?? hoveredEventId;
    return events.find((event) => event.id === activeId) ?? null;
  }, [events, hoveredEventId, selectedEventId]);

  const handleZoomIn = useCallback(() => {
    const map = mapRef.current;
    if (map) map.easeTo({ center: map.getCenter(), zoom: map.getZoom() + 1, duration: 300 });
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = mapRef.current;
    if (map) map.easeTo({ center: map.getCenter(), zoom: Math.max(map.getZoom() - 1, 1), duration: 300 });
  }, []);

  const handleMarkerClick = useCallback((event) => {
    setSelectedEventId(event.id);
    mapRef.current?.flyTo({
      center: [event.longitude, event.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 12),
      duration: 700,
      essential: true,
    });
  }, []);

  const handleToggleMaximize = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (element.requestFullscreen) element.requestFullscreen().catch(() => setIsMaximized(true));
      else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
      else setIsMaximized(true);
    } else if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else setIsMaximized(false);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMaximized(
        document.fullscreenElement === containerRef.current ||
        document.webkitFullscreenElement === containerRef.current,
      );
      window.setTimeout(() => mapRef.current?.resize(), 150);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (keyboardEvent) => {
      if (keyboardEvent.key === 'Escape' && isMaximized && !document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsMaximized(false);
        window.setTimeout(() => mapRef.current?.resize(), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized]);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden border border-gray-150 dark:border-white/5 shadow-md dark:shadow-2xl group transition-all duration-300 ${
      isMaximized
        ? 'fixed inset-0 z-[120] w-screen h-screen rounded-none bg-slate-900'
        : 'min-h-[600px] rounded-[32px] bg-slate-100 dark:bg-black'
    }`}>
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(mapEvent) => setViewState(mapEvent.viewState)}
        onClick={() => setSelectedEventId(null)}
        mapboxAccessToken={appConfig.mapboxAccessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        logoPosition="bottom-left"
        attributionControl={false}
      >
        {events.map((event) => {
          const color = getCategoryColor(event.category);
          return (
            <Marker key={event.id} latitude={event.latitude} longitude={event.longitude} anchor="center">
              <button
                type="button"
                aria-label={`View ${event.title}`}
                onClick={(clickEvent) => { clickEvent.stopPropagation(); handleMarkerClick(event); }}
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
                className="relative flex w-[250px] -translate-x-8 -translate-y-8 cursor-pointer items-center text-left group/marker"
              >
                <span
                  className="absolute left-8 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: `radial-gradient(circle, ${color} 0%, ${hexToRgba(color, 0.25)} 40%, transparent 70%)`, filter: 'blur(14px)', mixBlendMode: 'screen' }}
                />
                <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black shadow-2xl transition-transform duration-300 group-hover/marker:scale-110" style={{ border: `3.5px solid ${color}`, boxShadow: `0 0 18px 2px ${hexToRgba(color, 0.55)}` }}>
                  {event.bannerImageUrl ? <img src={event.bannerImageUrl} className="h-full w-full object-cover" alt="" /> : <CalendarDays size={24} color="white" />}
                </span>
                <span className="z-10 ml-4 min-w-0">
                  <span className="block truncate text-[14px] font-bold tracking-wide text-white" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.8)' }}>{event.title}</span>
                  <span className="mt-0.5 block text-[11px] font-semibold" style={{ color }}>{event.category || STATUS_LABELS[event.status]}</span>
                </span>
              </button>
            </Marker>
          );
        })}

        {activeEvent && (
          <Popup
            latitude={activeEvent.latitude}
            longitude={activeEvent.longitude}
            anchor="bottom"
            offset={42}
            closeOnClick={false}
            onClose={() => { setSelectedEventId(null); setHoveredEventId(null); }}
          >
            <EventDetails event={activeEvent} />
          </Popup>
        )}
      </Map>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]">
          <div className="rounded-2xl bg-white/90 px-5 py-3 text-sm font-bold text-slate-700 shadow-xl">Loading active events…</div>
        </div>
      )}

      {!isLoading && error && (
        <div className="absolute inset-x-6 top-6 z-20 rounded-2xl border border-red-200 bg-white/95 p-4 text-sm text-slate-700 shadow-xl">
          <p className="font-bold">Unable to load event locations</p>
          <p className="mt-1 text-xs text-slate-500">{error}</p>
          <button type="button" onClick={() => loadEvents({ showLoading: true })} className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600"><RotateCw size={13} />Retry</button>
        </div>
      )}

      {!isLoading && !error && events.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-2xl bg-white/90 px-5 py-3 text-center shadow-xl">
            <p className="text-sm font-bold text-slate-700">No active events with map locations</p>
            <p className="mt-1 text-xs text-slate-500">New published events will appear here automatically.</p>
          </div>
        </div>
      )}

      <button onClick={handleToggleMaximize} className="absolute top-6 right-6 p-3.5 bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200/55 dark:border-white/10 rounded-2xl text-gray-705 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-black/90 transition-all duration-300 z-30 shadow-lg dark:shadow-2xl hover:scale-105 active:scale-95" title={isMaximized ? 'Restore map' : 'Maximize map'}>
        {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-30">
        <button onClick={handleZoomIn} aria-label="Zoom in" className="p-3.5 bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200/55 dark:border-white/10 rounded-2xl text-gray-755 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-black/90 transition-all duration-300 shadow-lg dark:shadow-2xl hover:scale-105 active:scale-95"><Plus size={18} /></button>
        <button onClick={handleZoomOut} aria-label="Zoom out" className="p-3.5 bg-white/80 dark:bg-black/70 backdrop-blur-md border border-gray-200/55 dark:border-white/10 rounded-2xl text-gray-755 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-black/90 transition-all duration-300 shadow-lg dark:shadow-2xl hover:scale-105 active:scale-95"><Minus size={18} /></button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/85 dark:bg-black/60 backdrop-blur-md border border-gray-200/55 dark:border-white/10 rounded-full text-[10px] font-extrabold text-gray-755 dark:text-white/70 z-30 tracking-widest shadow-md dark:shadow-2xl">
        {Math.round((viewState.zoom / 20) * 100)}%
      </div>
    </div>
  );
};

export default EventMap;
