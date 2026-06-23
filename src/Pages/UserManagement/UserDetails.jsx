import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, ChevronDown, MapPin, Calendar } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getApiErrorMessage } from '@/shared/api';
import { getStorageDownloadUrl } from '@/shared/storage/object-storage.service';
import { userManagementService } from '@/features/users';

const formatAccountType = (type) => {
  if (type === 'business') return 'Business Account';
  return 'Personal Account';
};

const formatDate = (value) => {
  if (!value) return 'N/A';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getAvatarUrl = (user) => (
  user?.avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(user?.email || user?.id || 'user')}`
);

const getDocumentName = (key) => {
  if (!key) return null;

  return key.split('/').pop() || 'Business-document.pdf';
};

const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Profile');
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [apiUser, setApiUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  const loadUser = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const user = await userManagementService.getUser(id);
      setApiUser(user);
    } catch (loadError) {
      setApiUser(null);
      setError(getApiErrorMessage(loadError, 'Unable to load user details.'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const user = useMemo(() => {
    if (!apiUser) {
      return null;
    }

    return {
      id: apiUser.id,
      name: apiUser.name || 'Unnamed user',
      username: apiUser.username ? `@${apiUser.username}` : 'N/A',
      email: apiUser.email || 'N/A',
      gender: apiUser.gender || 'N/A',
      age: apiUser.age ?? 'N/A',
      address: apiUser.address || 'N/A',
      joiningDate: formatDate(apiUser.createdAt),
      deletion: 'N/A',
      bio: apiUser.bio || 'No bio added.',
      avatar: getAvatarUrl(apiUser),
      status: apiUser.isActive ? 'Active' : 'Suspended',
      accountType: formatAccountType(apiUser.accountType),
      emailVerified: apiUser.emailVerified,
      businessDocumentKey: apiUser.businessDocumentKey,
    };
  }, [apiUser]);

  const handleVerificationUpdate = async (emailVerified) => {
    if (!apiUser) return;

    setIsUpdatingVerification(true);

    try {
      const updatedUser = await userManagementService.updateUser(apiUser.id, { emailVerified });
      setApiUser(updatedUser);
      setIsVerifyOpen(false);
    } catch (verificationError) {
      window.alert(getApiErrorMessage(verificationError, 'Unable to update verification status.'));
    } finally {
      setIsUpdatingVerification(false);
    }
  };

  const loadEvents = useCallback(async () => {
    if (!id) return;

    setEventsLoading(true);
    setEventsError(null);

    try {
      const groups = await userManagementService.getUserEvents(id);

      const resolveUrls = async (list) =>
        Promise.all(
          list.map(async (event) => {
            if (!event.bannerImageKey) return event;
            try {
              const url = await getStorageDownloadUrl(event.bannerImageKey);
              return { ...event, bannerImageUrl: url };
            } catch {
              return event;
            }
          }),
        );

      const [active, past] = await Promise.all([
        resolveUrls(groups.active ?? []),
        resolveUrls(groups.past ?? []),
      ]);

      setEvents({ active, past });
      setEventsLoaded(true);
    } catch (loadError) {
      setEventsError(getApiErrorMessage(loadError, 'Unable to load events.'));
    } finally {
      setEventsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'Event' && !eventsLoaded && !eventsLoading) {
      void loadEvents();
    }
  }, [activeTab, eventsLoaded, eventsLoading, loadEvents]);

  const handleDocumentDownload = async () => {
    if (!user?.businessDocumentKey) return;

    try {
      const url = await getStorageDownloadUrl(user.businessDocumentKey);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (downloadError) {
      window.alert(getApiErrorMessage(downloadError, 'Unable to open business document.'));
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-12 duration-500 animate-in fade-in">
      {/* Row 1 & 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Email</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.email}</p>
        </div>
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Username</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.username}</p>
        </div>
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Gender</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.gender}</p>
        </div>
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Age</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.age}</p>
        </div>
      </div>

      {/* Row 3 - Full Width Address */}
      <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Address</p>
        <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.address}</p>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Joining Date</p>
          <p className="text-[15px] font-medium text-[#1A1A4B] dark:text-white transition-colors">{user.joiningDate}</p>
        </div>
        <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Deletion (30 days timeline)</p>
          <p className="text-[15px] font-bold text-red-500">{user.deletion}</p>
        </div>
      </div>

      {/* Row 5 - Bio */}
      <div className="pb-4 border-b border-[#525252] dark:border-gray-800 transition-colors">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Bio</p>
        <p className="text-[14px] leading-relaxed text-[#1A1A4B] dark:text-gray-300 font-medium transition-colors">{user.bio}</p>
      </div>

      {/* Documents Section */}
      <div className="pt-4">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-8">DOCUMENT OF THE BUSINESS</p>
        {user.businessDocumentKey ? (
          <button
            type="button"
            onClick={handleDocumentDownload}
            className="w-[110px] h-[130px] bg-white dark:bg-[#1E1E2D] rounded-[16px] flex flex-col items-center justify-center gap-3 border border-gray-200 dark:border-gray-800 relative group cursor-pointer hover:shadow-md transition-all shadow-sm"
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-12 border-2 border-gray-800 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-4 bg-gray-800 flex items-center justify-center">
                  <span className="text-[7px] font-black text-white">PDF</span>
                </div>
                <div className="pt-4 space-y-1">
                  <div className="w-6 h-0.5 bg-gray-200"></div>
                  <div className="w-6 h-0.5 bg-gray-200"></div>
                  <div className="w-4 h-0.5 bg-gray-200"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 absolute bottom-3">
              <p className="max-w-[72px] truncate text-[9px] font-bold text-gray-500">
                {getDocumentName(user.businessDocumentKey)}
              </p>
              <Download size={11} className="text-gray-400" />
            </div>
          </button>
        ) : (
          <p className="text-[14px] font-medium text-gray-400">No business document uploaded.</p>
        )}
      </div>
    </div>
  );

  const getEventStatusBadge = (status) => {
    const map = {
      published: { label: 'Published', className: 'bg-[#10B981]' },
      live: { label: 'Live', className: 'bg-red-500' },
      completed: { label: 'Completed', className: 'bg-[#6366F1]' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-500' },
      draft: { label: 'Draft', className: 'bg-gray-400' },
    };
    return map[status] ?? { label: status, className: 'bg-gray-400' };
  };

  const renderEventCard = (event) => {
    const badge = getEventStatusBadge(event.status);
    const locationLabel = event.location?.venue || event.location?.address || event.location?.searchLabel;

    return (
      <div key={event.id} className="bg-white dark:bg-[#1E1E2D] rounded-[22px] overflow-hidden shadow-sm border border-gray-50 dark:border-gray-800 group hover:shadow-xl transition-all duration-300">
        <div className="px-6 pt-6 pb-6">
          <div className="relative h-[260px] rounded-[20px] overflow-hidden bg-gray-100 dark:bg-[#2D2D3F]">
            {event.bannerImageUrl ? (
              <img
                src={event.bannerImageUrl}
                alt={event.name ?? 'Event'}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar size={40} className="text-gray-300 dark:text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 ${badge.className} rounded-full`}>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{badge.label}</span>
            </div>
            <div className="absolute bottom-5 left-5 right-5 space-y-2">
              {event.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                {event.name ?? 'Untitled event'}
              </h3>
              <div className="flex items-center gap-3 text-white/70 text-[11px] font-medium">
                {event.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(event.scheduledAt)}
                  </span>
                )}
                {locationLabel && (
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <MapPin size={11} />
                    {locationLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-gray-100 dark:bg-[#2D2D3F] text-gray-500 dark:text-gray-400">
                {event.privacy}
              </span>
              {event.tickets?.length > 0 && (
                <span className="text-[11px] text-gray-400 font-medium">
                  {event.tickets.length} {event.tickets.length === 1 ? 'ticket' : 'tickets'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEventSection = (title, list) => {
    if (!list?.length) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">{title}</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {list.map(renderEventCard)}
        </div>
      </div>
    );
  };

  const renderEventTab = () => {
    if (eventsLoading) {
      return (
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400 py-8 duration-500 animate-in fade-in">
          <Spinner className="size-4" />
          Loading events...
        </div>
      );
    }

    if (eventsError) {
      return (
        <div className="space-y-4 py-8 duration-500 animate-in fade-in">
          <p className="text-sm font-bold text-red-500">{eventsError}</p>
          <button
            type="button"
            onClick={loadEvents}
            className="rounded-xl bg-[#433E6F] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#343058]"
          >
            Retry
          </button>
        </div>
      );
    }

    const hasActive = events?.active?.length > 0;
    const hasPast = events?.past?.length > 0;

    if (!hasActive && !hasPast) {
      return (
        <div className="py-16 text-center duration-500 animate-in fade-in">
          <Calendar size={36} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-bold text-gray-400">No events yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-10 duration-500 animate-in fade-in">
        {renderEventSection('Upcoming', events.active)}
        {renderEventSection('Past', events.past)}
      </div>
    );
  };

  const renderCommerceTab = () => (
    <div className="grid grid-cols-1 gap-10 duration-500 lg:grid-cols-2 animate-in fade-in">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-6 group">
          <div className="relative aspect-square rounded-[32px] overflow-hidden bg-white dark:bg-[#1E1E2D] shadow-sm border border-gray-50 dark:border-gray-800 group-hover:shadow-xl transition-all duration-500">
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop"
              alt="Product"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 right-4 px-2 py-1 bg-black/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
              1/3
            </div>
          </div>

          <div className="px-2 space-y-4">
            <div className="flex items-start justify-between">
              <span className="px-3 py-1 bg-gray-200 dark:bg-[#2D2D3F] text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Skin Care
              </span>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-400 text-[11px] font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all">
                Action <ChevronDown size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-[22px] font-bold text-[#1A1A4B] dark:text-white transition-colors">Medusa Skin Whitening Cream</h3>
              <p className="text-[14px] leading-relaxed text-gray-400 font-medium">
                Premium skin brightening cream with Arbutin, Niacinamide & Hyaluronic Acid. For all skin types. Present QR code at event to collect.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <p className="text-[28px] font-bold text-[#1A1A4B] dark:text-white transition-colors">$28</p>
              <p className="text-[18px] font-medium text-gray-300 line-through">$32</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#13131F] p-8 transition-colors duration-300">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 text-sm font-bold text-gray-400">
          <Spinner className="size-4" />
          Loading user details...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#13131F] p-8 transition-colors duration-300">
        <div className="mx-auto max-w-[1400px]">
          <p className="mb-4 text-sm font-bold text-red-500">{error || 'User not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/user-management')}
            className="rounded-xl bg-[#433E6F] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#343058]"
          >
            Back to users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#13131F] p-8 transition-colors duration-300">
      <div className="mx-auto max-w-[1400px]">
        {/* Profile Card Section */}
        <div className="flex flex-col justify-between gap-8 mb-12 md:flex-row md:items-center">
          <div className="flex items-center gap-8">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="object-cover w-20 h-20 border-2 border-white rounded-full shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-[#3B82F6] p-1 rounded-full border-2 border-white shadow-sm">
                <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-white text-[9px] font-black rounded-lg uppercase tracking-widest ${user.status === 'Active' ? 'bg-[#10B981]' : 'bg-red-500'}`}>
                  {user.status}
                </span>
                <span className="px-3 py-1 bg-[#E2E8F0] dark:bg-[#1E1E2D] text-[#64748B] text-[9px] font-black rounded-lg uppercase tracking-widest">
                  {user.accountType}
                </span>
              </div>
              <h2 className="text-[28px] font-bold text-[#1A1A4B] dark:text-white transition-colors leading-tight tracking-tight">{user.name}</h2>
              <p className="text-sm font-medium text-gray-400 leading-tight">{user.username}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsVerifyOpen(!isVerifyOpen)}
              className="flex items-center gap-3 px-5 py-2 bg-white dark:bg-[#1E1E2D] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all shadow-sm"
            >
              {user.emailVerified ? 'Verified' : 'Not verified'}
              <ChevronDown size={14} className={`transition-transform ${isVerifyOpen ? 'rotate-180' : ''}`} />
            </button>
            {isVerifyOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-30 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                <button
                  disabled={isUpdatingVerification}
                  onClick={() => handleVerificationUpdate(true)}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] disabled:opacity-50 transition-colors"
                >
                  Verified
                </button>
                <button
                  disabled={isUpdatingVerification}
                  onClick={() => handleVerificationUpdate(false)}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D2D3F] disabled:opacity-50 transition-colors"
                >
                  Disproved
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-8">
            {['Profile', 'Event', 'Commerce'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[14px] font-bold transition-all relative ${activeTab === tab ? 'text-black dark:text-white' : 'text-gray-300 hover:text-gray-500 dark:hover:text-gray-400'
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black dark:bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="mt-8">
          {activeTab === 'Profile' && renderProfileTab()}
          {activeTab === 'Event' && renderEventTab()}
          {activeTab === 'Commerce' && renderCommerceTab()}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
