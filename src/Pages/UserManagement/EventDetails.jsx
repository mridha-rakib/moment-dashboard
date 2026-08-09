import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Gift,
  ImageIcon,
  MapPin,
  Tag,
  Ticket,
  UserRound,
  Video,
  Users,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getApiErrorMessage } from '@/shared/api';
import { getStorageDownloadUrl } from '@/shared/storage/object-storage.service';
import { userManagementService } from '@/features/users';
import CrowdStatusBadge from '@/shared/CrowdStatusBadge';

const formatLabel = (value) => {
  if (!value) return 'N/A';

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Free';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatBytes = (value) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return null;

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getLocationTitle = (location) => (
  location?.venue ||
  location?.searchLabel ||
  location?.formattedAddress ||
  location?.address ||
  'Location not specified'
);

const getLocationAddress = (location) => (
  location?.formattedAddress ||
  location?.address ||
  [location?.addressLine1, location?.city, location?.region, location?.country]
    .filter(Boolean)
    .join(', ') ||
  null
);

const getStatusBadgeClassName = (status) => {
  const map = {
    published: 'bg-[#10B981]',
    live: 'bg-red-500',
    completed: 'bg-[#6366F1]',
    cancelled: 'bg-gray-500',
  };

  return map[status] ?? 'bg-gray-400';
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#1E1E2D]">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[#433E6F] dark:bg-[#2D2D3F] dark:text-gray-200">
      {React.createElement(icon, { size: 18 })}
    </div>
    <div className="min-w-0">
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="break-words text-sm font-bold text-[#1A1A4B] dark:text-white">{value || 'N/A'}</p>
    </div>
  </div>
);

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [mediaUrls, setMediaUrls] = useState({});
  const [failedMediaIds, setFailedMediaIds] = useState(() => new Set());

  const loadEvent = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await userManagementService.getEvent(id);
      setEvent(response);
    } catch (loadError) {
      setEvent(null);
      setError(getApiErrorMessage(loadError, 'Unable to load event details.'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    let isActive = true;
    setBannerUrl(null);
    setBannerFailed(false);

    if (!event?.bannerImageKey) {
      return () => {
        isActive = false;
      };
    }

    getStorageDownloadUrl(event.bannerImageKey)
      .then((url) => {
        if (isActive) setBannerUrl(url);
      })
      .catch(() => {
        if (isActive) setBannerFailed(true);
      });

    return () => {
      isActive = false;
    };
  }, [event?.bannerImageKey]);

  useEffect(() => {
    let isCancelled = false;
    const createdUrls = [];
    setMediaUrls({});
    setFailedMediaIds(new Set());

    const mediaItems = event?.eventMedia ?? [];
    if (mediaItems.length === 0) {
      return () => {
        isCancelled = true;
      };
    }

    const loadMedia = async () => {
      const entries = await Promise.all(
        mediaItems.map(async (item) => {
          try {
            const objectUrl = await userManagementService.getEventMediaObjectUrl(item.url);
            if (isCancelled) {
              URL.revokeObjectURL(objectUrl);
              return null;
            }
            createdUrls.push(objectUrl);
            return [item.id, objectUrl];
          } catch {
            return null;
          }
        }),
      );

      if (!isCancelled) {
        setMediaUrls(Object.fromEntries(entries.filter(Boolean)));
      }
    };

    void loadMedia();

    return () => {
      isCancelled = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [event?.id, event?.eventMedia]);

  const locationTitle = useMemo(() => getLocationTitle(event?.location), [event?.location]);
  const locationAddress = useMemo(() => getLocationAddress(event?.location), [event?.location]);
  const showBanner = bannerUrl && !bannerFailed;
  const hasMedia = (event?.eventMedia ?? []).length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] p-8 transition-colors duration-300 dark:bg-[#13131F]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 text-sm font-bold text-gray-400">
          <Spinner className="size-4" />
          Loading event details...
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] p-8 transition-colors duration-300 dark:bg-[#13131F]">
        <div className="mx-auto max-w-[1400px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 dark:bg-[#1E1E2D] dark:text-gray-300 dark:hover:bg-[#2D2D3F]"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <p className="mb-4 text-sm font-bold text-red-500">{error || 'Event not found.'}</p>
          <button
            type="button"
            onClick={loadEvent}
            className="rounded-xl bg-[#433E6F] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#343058]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-8 transition-colors duration-300 dark:bg-[#13131F]">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <div className="relative h-[360px] overflow-hidden rounded-[28px] bg-gray-100 shadow-sm dark:bg-[#1E1E2D]">
          {showBanner ? (
            <img
              src={bannerUrl}
              alt={event.name || 'Event banner'}
              className="h-full w-full object-cover"
              onError={() => setBannerFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Calendar size={56} className="text-gray-300 dark:text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-6 top-6 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-[#1A1A4B] shadow-sm transition-all hover:bg-white"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="absolute bottom-8 left-8 right-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white ${getStatusBadgeClassName(event.status)}`}>
                {formatLabel(event.status)}
              </span>
              <CrowdStatusBadge eventStatus={event.status} crowdStatus={event.crowdStatus} />
              <span className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                {formatLabel(event.privacy)}
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
              {event.name || 'Untitled event'}
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-white/80">
              <span className="inline-flex items-center gap-2">
                <Calendar size={16} />
                {formatDateTime(event.scheduledAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} />
                {locationTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1E1E2D]">
              <h2 className="mb-4 text-lg font-black text-[#1A1A4B] dark:text-white">About</h2>
              <p className="whitespace-pre-line text-sm font-medium leading-7 text-gray-600 dark:text-gray-300">
                {event.description || 'No description provided.'}
              </p>
              {event.hashtags?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {event.hashtags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-500 dark:bg-[#2D2D3F] dark:text-gray-300">
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem icon={Clock} label="Starts" value={formatDateTime(event.scheduledAt)} />
              <DetailItem icon={Clock} label="Ends" value={formatDateTime(event.endAt)} />
              <DetailItem icon={Users} label="Members" value={`${event.memberCount ?? 0}`} />
              <DetailItem icon={UserRound} label="Host" value={event.host?.name || 'N/A'} />
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1E1E2D]">
              <h2 className="mb-5 text-lg font-black text-[#1A1A4B] dark:text-white">Location</h2>
              <div className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                <p className="font-bold text-[#1A1A4B] dark:text-white">{locationTitle}</p>
                {locationAddress && <p>{locationAddress}</p>}
                {event.location?.additionalInfo && <p>{event.location.additionalInfo}</p>}
                {typeof event.location?.latitude === 'number' && typeof event.location?.longitude === 'number' && (
                  <p className="text-xs text-gray-400">
                    {event.location.latitude.toFixed(5)}, {event.location.longitude.toFixed(5)}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1E1E2D]">
              <h2 className="mb-5 text-lg font-black text-[#1A1A4B] dark:text-white">Tickets</h2>
              {event.tickets?.length > 0 ? (
                <div className="space-y-3">
                  {event.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex flex-col justify-between gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-800 md:flex-row md:items-center">
                      <div>
                        <p className="font-bold text-[#1A1A4B] dark:text-white">{ticket.name}</p>
                        {ticket.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{ticket.description}</p>}
                        {ticket.salesEndAt && <p className="mt-2 text-xs font-bold text-gray-400">Sales end {formatDateTime(ticket.salesEndAt)}</p>}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-gray-500 dark:bg-[#2D2D3F] dark:text-gray-300">
                          <Ticket size={14} />
                          {ticket.capacity} capacity
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-gray-500 dark:bg-[#2D2D3F] dark:text-gray-300">
                          <DollarSign size={14} />
                          {formatCurrency(ticket.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-400">No tickets configured.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1E1E2D]">
              <h2 className="mb-5 text-lg font-black text-[#1A1A4B] dark:text-white">Gallery</h2>
              {hasMedia ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {event.eventMedia.map((item) => {
                    const source = mediaUrls[item.id];
                    const hasFailed = failedMediaIds.has(item.id);

                    return (
                      <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-[#2D2D3F]">
                        <div className="flex aspect-video items-center justify-center">
                          {source && !hasFailed && item.type === 'image' && (
                            <img
                              src={source}
                              alt="Event gallery item"
                              className="h-full w-full object-cover"
                              onError={() => {
                                setFailedMediaIds((current) => {
                                  const next = new Set(current);
                                  next.add(item.id);
                                  return next;
                                });
                              }}
                            />
                          )}
                          {source && !hasFailed && item.type === 'video' && (
                            <video
                              src={source}
                              className="h-full w-full object-cover"
                              controls
                              preload="metadata"
                              onError={() => {
                                setFailedMediaIds((current) => {
                                  const next = new Set(current);
                                  next.add(item.id);
                                  return next;
                                });
                              }}
                            />
                          )}
                          {(!source || hasFailed) && (
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              {item.type === 'video' ? <Video size={32} /> : <ImageIcon size={32} />}
                              <span className="text-xs font-bold">Media unavailable</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-400">
                          <span>{formatLabel(item.type)}</span>
                          <span>{formatBytes(item.fileSize)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-400">No gallery media uploaded.</p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1E1E2D]">
              <h2 className="mb-5 text-lg font-black text-[#1A1A4B] dark:text-white">Event Info</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {(event.categories?.length ? event.categories : [event.category]).filter(Boolean).map((category) => (
                      <span key={category} className="rounded-lg bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-500 dark:bg-[#2D2D3F] dark:text-gray-300">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Age restriction</p>
                  <p className="font-bold text-[#1A1A4B] dark:text-white">{formatLabel(event.ageRestriction)}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Going</p>
                  <p className="font-bold text-[#1A1A4B] dark:text-white">{event.publicGoingSummary?.going ?? 0}</p>
                </div>
                {event.cancelledAt && (
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Cancellation</p>
                    <p className="font-bold text-[#1A1A4B] dark:text-white">{formatDateTime(event.cancelledAt)}</p>
                    {(event.cancellationDisplayReason || event.cancellationCustomReason) && (
                      <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {event.cancellationDisplayReason || event.cancellationCustomReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#1E1E2D]">
              <h2 className="mb-5 text-lg font-black text-[#1A1A4B] dark:text-white">Rewards</h2>
              {event.rewards?.length > 0 ? (
                <div className="space-y-3">
                  {event.rewards.map((reward) => (
                    <div key={reward.id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                      <p className="flex items-center gap-2 font-bold text-[#1A1A4B] dark:text-white">
                        <Gift size={16} />
                        {reward.name}
                      </p>
                      {reward.description && <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">{reward.description}</p>}
                      {reward.expiresAt && <p className="mt-2 text-xs font-bold text-gray-400">Expires {formatDateTime(reward.expiresAt)}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-400">No rewards configured.</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
