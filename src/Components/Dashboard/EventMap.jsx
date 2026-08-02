import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarClock,
  CalendarDays,
  MapPin,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Radio,
  RotateCw,
  Tag,
  UserRound,
} from 'lucide-react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { dashboardService } from '../../features/dashboard';
import { appConfig } from '../../shared/config/env';
import { getCategoryColor } from '../../shared/eventCategories';
import CrowdStatusBadge from '../../shared/CrowdStatusBadge';

const STATUS_LABELS = {
  upcoming: 'Upcoming',
  live: 'Live',
  active: 'Active',
};

const STATUS_STYLES = {
  upcoming: 'border-indigo-100 bg-indigo-50 text-indigo-700',
  live: 'border-rose-100 bg-rose-50 text-rose-700',
  active: 'border-emerald-100 bg-emerald-50 text-emerald-700',
};

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

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const EventArtwork = ({ src }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [src]);

  if (!src || hasError) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <CalendarDays size={26} strokeWidth={1.8} />
      </div>
    );
  }

  return (
    <img
      className="h-16 w-16 shrink-0 rounded-2xl border border-white object-cover shadow-sm"
      src={src}
      alt=""
      onError={() => setHasError(true)}
    />
  );
};

const EventDetails = ({ event }) => {
  const categories = event.categories?.length ? event.categories : event.category ? [event.category] : [];

  return (
  <article className="w-[292px] overflow-hidden rounded-[20px] bg-white text-slate-900">
    <header className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 pb-4 pt-4">
      <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-indigo-100/60 blur-2xl" />
      <div className="relative flex items-start gap-3.5">
        <EventArtwork src={event.bannerImageUrl} />
        <div className="min-w-0 flex-1 pr-4">
          <h3
            className="break-words text-[15px] font-extrabold leading-5 text-slate-900"
            style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}
            title={event.title || 'Untitled Event'}
          >
            {event.title || 'Untitled Event'}
          </h3>
          <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${STATUS_STYLES[event.status] ?? STATUS_STYLES.active}`}>
            <Radio size={11} strokeWidth={2.5} />
            {STATUS_LABELS[event.status] ?? 'Active'}
          </span>
          <div className="mt-1.5 flex justify-start">
            <CrowdStatusBadge eventStatus={event.status} crowdStatus={event.crowdStatus} />
          </div>
        </div>
      </div>
    </header>

    <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-xs">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <CalendarClock size={16} strokeWidth={2} />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Date & time</p>
          <p className="mt-0.5 break-words font-semibold leading-4 text-slate-700">{formatStartTime(event.scheduledAt)}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <MapPin size={16} strokeWidth={2} />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Location</p>
          <p
            className="mt-0.5 break-words font-semibold leading-4 text-slate-700"
            style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}
            title={event.locationName || 'Location unavailable'}
          >
            {event.locationName || 'Location unavailable'}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <UserRound size={16} strokeWidth={2} />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Hosted by</p>
          <p
            className="mt-0.5 break-words font-semibold leading-4 text-slate-700"
            style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}
            title={event.hostName || 'Host unavailable'}
          >
            {event.hostName || 'Host unavailable'}
          </p>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Tag size={16} strokeWidth={2} />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">Category</p>
            <p className="mt-0.5 break-words font-semibold leading-4 text-slate-700">{categories.join(' · ')}</p>
          </div>
        </div>
      )}
    </div>
  </article>
  );
};

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
            offset={38}
            maxWidth="320px"
            className="event-map-popup"
            closeOnClick={false}
            focusAfterOpen={false}
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
