const CROWD_STATUS_LABELS = {
  not_busy: 'Not Busy',
  busy: 'Busy',
  very_busy: 'Very Busy',
};

const CROWD_STATUS_STYLES = {
  not_busy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  busy: 'bg-[#EDE9F8] text-[#BB5E30] border-[#EDE9F8]',
  very_busy: 'bg-rose-50 text-rose-700 border-rose-100',
};

const isSupportedCrowdStatus = (value) =>
  value === 'not_busy' || value === 'busy' || value === 'very_busy';

export default function CrowdStatusBadge({ eventStatus, crowdStatus, className = '' }) {
  if (eventStatus !== 'live' || !isSupportedCrowdStatus(crowdStatus)) {
    return null;
  }

  return (
    <span
      className={`inline-flex h-5 items-center justify-center whitespace-nowrap rounded-lg border px-1.5 py-0.5 text-[12px] font-semibold leading-4 tracking-[-0.08px] ${CROWD_STATUS_STYLES[crowdStatus]} ${className}`}
    >
      {CROWD_STATUS_LABELS[crowdStatus]}
    </span>
  );
}
