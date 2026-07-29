import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, RotateCcw, ShieldAlert } from "lucide-react";
import { httpClient } from "@/shared/api/http-client";
import { getApiErrorMessage } from "@/shared/api/api-error";

const MODE_EVENT = "event";
const MODE_USER_REFUNDS = "user_refunds";
const MODE_NON_MONETARY = "non_monetary";
const PAGE_LIMIT = 20;

const modes = [
  [MODE_EVENT, "Event Cancellation Refunds"],
  [MODE_USER_REFUNDS, "User Ticket Refunds"],
  [MODE_NON_MONETARY, "Non-Monetary Cancellation Audit"],
];

const createFilters = () => ({
  search: "",
  status: "",
  ticketType: "",
});

const defaultPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

const statusTone = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-400/20",
  processing: "bg-sky-500/10 text-sky-300 border-sky-400/20",
  partially_completed: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  completed: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  needs_attention: "bg-red-500/10 text-red-300 border-red-400/20",
  succeeded: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  failed_retryable: "bg-amber-500/10 text-amber-300 border-amber-400/20",
  failed_terminal: "bg-red-500/10 text-red-300 border-red-400/20",
  reconciliation_required: "bg-red-500/10 text-red-300 border-red-400/20",
  cancelled: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  not_required: "bg-white/5 text-gray-300 border-white/10",
  not_recorded: "bg-white/5 text-gray-300 border-white/10",
};

const eventStatusOptions = [
  ["", "All statuses"],
  ["pending", "Pending"],
  ["processing", "Processing"],
  ["partially_completed", "Partially completed"],
  ["completed", "Completed"],
  ["needs_attention", "Needs attention"],
  ["aborted", "Aborted"],
];

const userRefundStatusOptions = [
  ["", "All statuses"],
  ["pending", "Pending"],
  ["processing", "Processing"],
  ["succeeded", "Succeeded"],
  ["failed_retryable", "Retryable"],
  ["failed_terminal", "Terminal"],
  ["reconciliation_required", "Needs reconcile"],
];

const auditStatusOptions = [
  ["", "All statuses"],
  ["cancelled", "Cancelled"],
  ["needs_attention", "Needs attention"],
];

const ticketTypeOptions = [
  ["", "All ticket types"],
  ["free", "Free"],
  ["rewarded", "Rewarded"],
];

const modeCopy = {
  [MODE_EVENT]: {
    title: "Event Cancellation Refunds",
    description: "Host-initiated event cancellation refund batches and recovery actions.",
    listTitle: "Events",
    empty: "No event cancellation refunds found.",
    search: "Search event or host",
  },
  [MODE_USER_REFUNDS]: {
    title: "User Ticket Refunds",
    description: "Paid and discounted individual ticket cancellation refunds.",
    listTitle: "Ticket Refunds",
    empty: "No user ticket refunds found.",
    search: "Search buyer, email, event or ticket",
  },
  [MODE_NON_MONETARY]: {
    title: "Non-Monetary Cancellation Audit",
    description: "Free and rewarded ticket cancellation audit records.",
    listTitle: "Cancellation Audit",
    empty: "No non-monetary ticket cancellations found.",
    search: "Search buyer, email, event or ticket",
  },
};

const humanize = (value) => String(value || "unknown").replaceAll("_", " ");

const StatusPill = ({ status }) => (
  <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${statusTone[status] || "bg-white/5 text-gray-300 border-white/10"}`}>
    {humanize(status)}
  </span>
);

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{children}</span>
);

const DetailLine = ({ label, children }) => (
  <div className="min-w-0 space-y-1">
    <FieldLabel>{label}</FieldLabel>
    <div className="break-words text-xs font-medium text-gray-300">{children || "-"}</div>
  </div>
);

const formatMinor = (minor = 0, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const getCurrency = (record) => {
  if (record.currency) return record.currency;
  return Object.keys(record.currencySummaries || {})[0] || "usd";
};

const getEventName = (record) => record.event?.name || record.eventName || "Untitled event";

const getHostName = (record) => record.host?.name || "Unknown host";

const getBuyerName = (record) => record.buyer?.name || "Unknown buyer";

const getBuyerEmail = (record) => record.buyer?.email || "No email";

const getTicketName = (record) => record.ticketName || "Ticket";

const getPassLabel = (record) => {
  const passNumber = Number(record.ticketIndex);
  return Number.isFinite(passNumber) && passNumber > 0 ? `Pass ${passNumber}` : "Pass";
};

const getTicketTypeLabel = (record) => {
  if (record.ticketType === "rewarded") return "Rewarded Ticket";
  if (record.ticketType === "free") return "Free Ticket";
  if (record.ticketType === "paid") return "Paid Ticket";
  return record.requestedAmountMinor > 0 ? "Paid Ticket" : "Free Ticket";
};

const formatNotificationState = (state) => {
  const entries = [
    ["buyerAcceptedSentAt", "buyer"],
    ["buyerRefundProcessingSentAt", "processing"],
    ["buyerRefundCompletedSentAt", "completed"],
    ["buyerNeedsAttentionSentAt", "needs attention"],
    ["recipientSentAt", "recipient"],
    ["hostSentAt", "host"],
  ];
  const sent = entries.filter(([key]) => Boolean(state?.[key])).map(([, label]) => label);
  return sent.length > 0 ? `Sent to ${sent.join(", ")}` : "No notifications recorded";
};

const hasFilters = (filters) => Object.values(filters).some((value) => String(value ?? "").trim());

const getUserParams = (mode, page, filters) => {
  const params = {
    page,
    limit: PAGE_LIMIT,
    monetary: mode === MODE_NON_MONETARY ? "non_monetary" : "monetary",
  };

  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.status) {
    if (mode === MODE_NON_MONETARY) params.status = filters.status;
    else params.refundStatus = filters.status;
  }
  if (mode === MODE_NON_MONETARY && filters.ticketType) params.ticketType = filters.ticketType;
  return params;
};

const getEventParams = (filters) => {
  const params = {};
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.status) params.status = filters.status;
  return params;
};

export default function RefundManagement() {
  const [mode, setMode] = useState(MODE_EVENT);
  const [records, setRecords] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [detailRows, setDetailRows] = useState([]);
  const [detailBatch, setDetailBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [error, setError] = useState("");
  const [pagesByMode, setPagesByMode] = useState({
    [MODE_USER_REFUNDS]: 1,
    [MODE_NON_MONETARY]: 1,
  });
  const [filtersByMode, setFiltersByMode] = useState({
    [MODE_EVENT]: createFilters(),
    [MODE_USER_REFUNDS]: createFilters(),
    [MODE_NON_MONETARY]: createFilters(),
  });
  const [pagination, setPagination] = useState(defaultPagination);

  const filters = filtersByMode[mode] || createFilters();
  const page = pagesByMode[mode] || 1;
  const selectedRecord = useMemo(
    () => records.find((record) => `${record.sourceType}:${record.id}` === selectedKey) || records[0] || null,
    [records, selectedKey],
  );
  const selectedAuditHistory = selectedRecord?.sourceType === "event_cancellation"
    ? detailBatch?.auditHistory || selectedRecord.auditHistory || []
    : detailRows[0]?.auditHistory || selectedRecord?.auditHistory || [];

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      if (mode === MODE_EVENT) {
        const response = await httpClient.get("/payments/admin/refund-batches", { params: getEventParams(filters) });
        const nextRecords = (response.data?.data?.batches || []).map((batch) => ({
          ...batch,
          sourceType: "event_cancellation",
        }));
        setRecords(nextRecords);
        setPagination({ ...defaultPagination, total: nextRecords.length, totalPages: nextRecords.length ? 1 : 0 });
        setSelectedKey((current) => (
          current && nextRecords.some((record) => `${record.sourceType}:${record.id}` === current)
            ? current
            : nextRecords[0] ? `${nextRecords[0].sourceType}:${nextRecords[0].id}` : null
        ));
        return;
      }

      const response = await httpClient.get("/payments/admin/ticket-cancellations", {
        params: getUserParams(mode, page, filters),
      });
      const nextRecords = (response.data?.data?.cancellations || []).map((record) => ({
        ...record,
        sourceType: "user_ticket_cancellation",
      }));
      const nextPagination = response.data?.meta?.pagination || {
        page,
        limit: PAGE_LIMIT,
        total: nextRecords.length,
        totalPages: nextRecords.length ? 1 : 0,
      };
      setRecords(nextRecords);
      setPagination(nextPagination);
      setSelectedKey((current) => (
        current && nextRecords.some((record) => `${record.sourceType}:${record.id}` === current)
          ? current
          : nextRecords[0] ? `${nextRecords[0].sourceType}:${nextRecords[0].id}` : null
      ));
      if (nextPagination.totalPages > 0 && page > nextPagination.totalPages) {
        setPagesByMode((current) => ({ ...current, [mode]: nextPagination.totalPages }));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load refund management records."));
    } finally {
      setIsLoading(false);
    }
  }, [filters, mode, page]);

  const loadDetails = useCallback(async (record) => {
    if (!record?.id) {
      setDetailRows([]);
      setDetailBatch(null);
      return;
    }

    setError("");
    try {
      if (record.sourceType === "event_cancellation") {
        const response = await httpClient.get(`/payments/admin/refund-batches/${record.id}`);
        setDetailBatch({ ...response.data?.data?.batch, sourceType: "event_cancellation" });
        setDetailRows((response.data?.data?.refunds || []).map((refund) => ({
          ...refund,
          sourceType: "event_cancellation",
        })));
        return;
      }

      const response = await httpClient.get(`/payments/admin/ticket-cancellations/${record.id}`);
      const cancellation = response.data?.data?.cancellation;
      setDetailBatch(null);
      setDetailRows(cancellation ? [{ ...cancellation, sourceType: "user_ticket_cancellation" }] : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load record details."));
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    void loadDetails(selectedRecord);
  }, [loadDetails, selectedRecord]);

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setRecords([]);
    setDetailRows([]);
    setDetailBatch(null);
    setSelectedKey(null);
    setPagination(defaultPagination);
    setPagesByMode((current) => ({ ...current, [nextMode]: 1 }));
  };

  const updateFilter = (field, value) => {
    setFiltersByMode((current) => ({
      ...current,
      [mode]: { ...current[mode], [field]: value },
    }));
    setSelectedKey(null);
    if (mode !== MODE_EVENT) {
      setPagesByMode((current) => ({ ...current, [mode]: 1 }));
    }
  };

  const clearFilters = () => {
    setFiltersByMode((current) => ({ ...current, [mode]: createFilters() }));
    setSelectedKey(null);
    if (mode !== MODE_EVENT) {
      setPagesByMode((current) => ({ ...current, [mode]: 1 }));
    }
  };

  const setPage = (updater) => {
    setPagesByMode((current) => {
      const previousPage = current[mode] || 1;
      const nextPage = typeof updater === "function" ? updater(previousPage) : updater;
      return { ...current, [mode]: Math.max(1, nextPage) };
    });
  };

  const runAction = async (path, label) => {
    if (mode === MODE_NON_MONETARY) return;
    if (!window.confirm(`${label}?`)) return;

    setIsActionPending(true);
    setError("");
    try {
      await httpClient.post(path);
      await loadRecords();
      await loadDetails(selectedRecord);
    } catch (err) {
      setError(getApiErrorMessage(err, "Refund action failed."));
    } finally {
      setIsActionPending(false);
    }
  };

  const statusOptions = mode === MODE_EVENT ? eventStatusOptions : mode === MODE_NON_MONETARY ? auditStatusOptions : userRefundStatusOptions;
  const activeCopy = modeCopy[mode];

  const renderFilters = () => (
    <div className="grid min-w-0 gap-2 border-b border-white/10 px-4 py-3">
      <label className="grid min-w-0 gap-1">
        <FieldLabel>Search</FieldLabel>
        <input
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder={activeCopy.search}
          className="h-9 w-full min-w-0 rounded-md border border-white/10 bg-black/20 px-3 text-xs font-medium text-gray-200 outline-none placeholder:text-gray-600"
        />
      </label>
      <label className="grid min-w-0 gap-1">
        <FieldLabel>Status</FieldLabel>
        <select
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="h-9 w-full min-w-0 rounded-md border border-white/10 bg-black/20 px-3 text-xs font-bold text-gray-300 outline-none"
        >
          {statusOptions.map(([value, label]) => (
            <option key={value || "all"} value={value}>{label}</option>
          ))}
        </select>
      </label>
      {mode === MODE_NON_MONETARY && (
        <label className="grid min-w-0 gap-1">
          <FieldLabel>Ticket Type</FieldLabel>
          <select
            value={filters.ticketType}
            onChange={(event) => updateFilter("ticketType", event.target.value)}
            className="h-9 w-full min-w-0 rounded-md border border-white/10 bg-black/20 px-3 text-xs font-bold text-gray-300 outline-none"
          >
            {ticketTypeOptions.map(([value, label]) => (
              <option key={value || "all"} value={value}>{label}</option>
            ))}
          </select>
        </label>
      )}
      {hasFilters(filters) && (
        <button
          type="button"
          onClick={clearFilters}
          className="h-9 w-full rounded-md border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/5"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  const renderEventCard = (record) => {
    const currency = getCurrency(record);
    const selected = selectedRecord && `${selectedRecord.sourceType}:${selectedRecord.id}` === `${record.sourceType}:${record.id}`;

    return (
      <button
        type="button"
        key={`${record.sourceType}:${record.id}`}
        onClick={() => setSelectedKey(`${record.sourceType}:${record.id}`)}
        className={`block w-full min-w-0 px-4 py-3 text-left hover:bg-white/5 ${selected ? "bg-white/5" : ""}`}
      >
        <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 truncate text-sm font-bold">{getEventName(record)}</span>
          <StatusPill status={record.status} />
        </div>
        <div className="truncate text-xs text-gray-400">Host: {getHostName(record)}</div>
        <div className="mt-1 text-xs text-gray-400">
          {record.totalEligibleOrders} orders - {formatMinor(record.totalCompletedAmountMinor, currency)} refunded
        </div>
        <div className="mt-1 text-[11px] text-gray-500">Cancelled {formatDateTime(record.event?.cancelledAt || record.createdAt)}</div>
      </button>
    );
  };

  const renderUserCard = (record) => {
    const selected = selectedRecord && `${selectedRecord.sourceType}:${selectedRecord.id}` === `${record.sourceType}:${record.id}`;
    const isAudit = mode === MODE_NON_MONETARY;

    return (
      <button
        type="button"
        key={`${record.sourceType}:${record.id}`}
        onClick={() => setSelectedKey(`${record.sourceType}:${record.id}`)}
        className={`block w-full min-w-0 px-4 py-3 text-left hover:bg-white/5 ${selected ? "bg-white/5" : ""}`}
      >
        <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
          <span className="min-w-0 truncate text-sm font-bold">{getBuyerName(record)}</span>
          <StatusPill status={isAudit ? record.status : record.refundStatus} />
        </div>
        <div className="truncate text-xs text-gray-400">
          {getEventName(record)} - {getTicketName(record)} - {getPassLabel(record)}
        </div>
        <div className="mt-1 text-xs text-gray-400">
          {isAudit
            ? `${getTicketTypeLabel(record)} - Refund not required`
            : `${formatMinor(record.completedAmountMinor, record.currency)} refunded`}
        </div>
        <div className="mt-1 text-[11px] text-gray-500">Cancelled {formatDateTime(record.cancelledAt)}</div>
      </button>
    );
  };

  const renderList = () => {
    if (isLoading) return <div className="p-4 text-sm text-gray-400">Loading...</div>;
    if (records.length === 0) return <div className="p-4 text-sm text-gray-400">{activeCopy.empty}</div>;

    return (
      <div className="min-w-0 divide-y divide-white/10">
        {records.map((record) => (mode === MODE_EVENT ? renderEventCard(record) : renderUserCard(record)))}
      </div>
    );
  };

  const renderPagination = () => {
    if (mode === MODE_EVENT) {
      return (
        <div className="border-t border-white/10 px-4 py-3 text-xs text-gray-500">
          {records.length} event refund {records.length === 1 ? "record" : "records"}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-gray-500">
        <span className="min-w-0 truncate">
          {pagination.total === 0 ? "0" : `${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)}`} of {pagination.total}
        </span>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={isLoading || pagination.page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-white/10 px-2 py-1 font-bold text-gray-300 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={isLoading || pagination.page >= pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-md border border-white/10 px-2 py-1 font-bold text-gray-300 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderEventActions = () => {
    if (!selectedRecord || mode !== MODE_EVENT) return null;

    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isActionPending}
          onClick={() => runAction(`/payments/admin/refund-batches/${selectedRecord.id}/reconcile`, "Reconcile this refund batch")}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-gray-200 hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Reconcile
        </button>
        <button
          type="button"
          disabled={isActionPending}
          onClick={() => runAction(`/payments/admin/refund-batches/${selectedRecord.id}/retry`, "Retry eligible failed refunds in this batch")}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#B9FF66] px-4 text-sm font-black text-[#111111] disabled:opacity-50"
        >
          <RotateCcw size={16} />
          Retry
        </button>
        <button
          type="button"
          disabled={isActionPending}
          onClick={() => runAction(`/payments/admin/refund-batches/${selectedRecord.id}/resume`, "Resume this refund batch")}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-gray-200 hover:bg-white/5 disabled:opacity-50"
        >
          Resume
        </button>
      </div>
    );
  };

  const renderUserActions = () => {
    if (!selectedRecord || mode !== MODE_USER_REFUNDS) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {selectedRecord.canReconcile && (
          <button
            type="button"
            disabled={isActionPending}
            onClick={() => runAction(`/payments/admin/ticket-cancellations/${selectedRecord.id}/reconcile`, "Reconcile this ticket refund")}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-gray-200 hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Reconcile
          </button>
        )}
        {selectedRecord.canRetry && (
          <button
            type="button"
            disabled={isActionPending}
            onClick={() => runAction(`/payments/admin/ticket-cancellations/${selectedRecord.id}/retry`, "Retry this ticket refund")}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#B9FF66] px-4 text-sm font-black text-[#111111] disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Retry
          </button>
        )}
      </div>
    );
  };

  const renderDetailHeader = () => {
    if (!selectedRecord) {
      return (
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-black">Select a record</h2>
        </div>
      );
    }

    return (
      <div className="flex min-w-0 flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h2 className="min-w-0 truncate text-lg font-black">
              {mode === MODE_EVENT ? getEventName(detailBatch || selectedRecord) : getBuyerName(selectedRecord)}
            </h2>
            <StatusPill status={mode === MODE_EVENT ? selectedRecord.status : mode === MODE_NON_MONETARY ? selectedRecord.status : selectedRecord.refundStatus} />
          </div>
          <p className="mt-1 min-w-0 truncate text-sm text-gray-400">
            {mode === MODE_EVENT
              ? `Host: ${getHostName(detailBatch || selectedRecord)}`
              : `${getEventName(selectedRecord)} - ${getTicketName(selectedRecord)} - ${getPassLabel(selectedRecord)}`}
          </p>
        </div>
        {renderEventActions()}
        {renderUserActions()}
      </div>
    );
  };

  const renderEventDetail = () => {
    const batch = detailBatch || selectedRecord;
    if (!batch) return null;
    const currency = getCurrency(batch);

    return (
      <>
        <div className="grid min-w-0 gap-4 border-b border-white/10 px-5 py-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailLine label="Event">{getEventName(batch)}</DetailLine>
          <DetailLine label="Host">{getHostName(batch)}<br /><span className="text-gray-500">{batch.host?.email || "No email"}</span></DetailLine>
          <DetailLine label="Schedule">{formatDateTime(batch.event?.scheduledAt)}</DetailLine>
          <DetailLine label="Cancelled">{formatDateTime(batch.event?.cancelledAt || batch.createdAt)}</DetailLine>
          <DetailLine label="Reason">{batch.displayReason || batch.reasonType}</DetailLine>
          <DetailLine label="Orders">{batch.totalEligibleOrders} affected</DetailLine>
          <DetailLine label="Progress">{batch.succeededCount}/{batch.totalEligibleOrders} completed</DetailLine>
          <DetailLine label="Amount">{formatMinor(batch.totalCompletedAmountMinor, currency)} / {formatMinor(batch.totalRequestedAmountMinor, currency)}</DetailLine>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3">Refund</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Attempts</th>
                <th className="px-5 py-3">Tax</th>
                <th className="px-5 py-3">Last Error</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {detailRows.map((refund, index) => (
                <tr key={`${refund.sourceType}:${refund.id}`}>
                  <td className="px-5 py-4 text-xs font-bold text-gray-300">Order refund {index + 1}</td>
                  <td className="px-5 py-4"><StatusPill status={refund.status} /></td>
                  <td className="px-5 py-4 text-gray-200">{formatMinor(refund.completedAmountMinor, refund.currency)} / {formatMinor(refund.requestedAmountMinor, refund.currency)}</td>
                  <td className="px-5 py-4 text-gray-300">{refund.attemptCount}</td>
                  <td className="px-5 py-4 text-gray-300">
                    {refund.taxReversal
                      ? `${formatMinor(refund.taxReversal.reversedTaxAmountMinor, refund.taxReversal.currency)} ${humanize(refund.taxReversal.status)}`
                      : "-"}
                  </td>
                  <td className="max-w-[260px] px-5 py-4 text-xs text-gray-400">{refund.safeLastErrorMessage || "-"}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() => runAction(`/payments/admin/refunds/${refund.id}/reconcile`, "Reconcile this refund")}
                        className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-gray-200 hover:bg-white/5 disabled:opacity-50"
                      >
                        Reconcile
                      </button>
                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() => runAction(`/payments/admin/refunds/${refund.id}/retry`, "Retry this refund")}
                        className="rounded-md bg-white px-3 py-2 text-xs font-black text-[#111111] disabled:opacity-50"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {detailRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">No refund rows for this event.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderUserDetail = () => {
    const record = detailRows[0] || selectedRecord;
    if (!record) return null;
    const isAudit = mode === MODE_NON_MONETARY;

    return (
      <>
        <div className="grid min-w-0 gap-4 border-b border-white/10 px-5 py-4 md:grid-cols-2 xl:grid-cols-4">
          <DetailLine label="Buyer">{getBuyerName(record)}<br /><span className="text-gray-500">{getBuyerEmail(record)}</span></DetailLine>
          <DetailLine label="Event">{getEventName(record)}</DetailLine>
          <DetailLine label="Ticket">{getTicketName(record)}<br /><span className="text-gray-500">{getTicketTypeLabel(record)}</span></DetailLine>
          <DetailLine label="Pass">{getPassLabel(record)}</DetailLine>
          <DetailLine label="Cancelled">{formatDateTime(record.cancelledAt)}</DetailLine>
          <DetailLine label={isAudit ? "Refund" : "Requested"}>{isAudit ? "Refund not required" : formatMinor(record.requestedAmountMinor, record.currency)}</DetailLine>
          {!isAudit && <DetailLine label="Completed">{formatMinor(record.completedAmountMinor, record.currency)}</DetailLine>}
          {!isAudit && <DetailLine label="Attempts">{record.attemptCount}</DetailLine>}
          {isAudit && <DetailLine label="Capacity"><StatusPill status={record.capacityReleaseStatus} /></DetailLine>}
          {isAudit && <DetailLine label="QR"><StatusPill status={record.qrInvalidationStatus} /></DetailLine>}
          {isAudit && <DetailLine label="Share"><StatusPill status={record.shareRevocationStatus} /></DetailLine>}
          {isAudit && <DetailLine label="Notifications">{formatNotificationState(record.notificationState)}</DetailLine>}
          <DetailLine label="Status"><StatusPill status={isAudit ? record.status : record.refundStatus} /></DetailLine>
          <DetailLine label="Last Error">{record.safeLastErrorMessage || "-"}</DetailLine>
        </div>
      </>
    );
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-[#0C0B10] p-6 text-white">
      <div className="mb-6 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight">Refund Management</h1>
          <p className="mt-1 text-sm text-gray-400">{activeCopy.description}</p>
        </div>
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-wrap rounded-md border border-white/10 bg-white/[0.03] p-1">
            {modes.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => switchMode(value)}
                className={`h-9 rounded px-3 text-xs font-black transition-colors ${mode === value ? "bg-[#B9FF66] text-[#111111]" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={loadRecords}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-gray-200 hover:bg-white/5"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-md border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          <ShieldAlert size={18} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-black uppercase tracking-wider text-gray-400">
            {activeCopy.listTitle}
          </div>
          {renderFilters()}
          {renderList()}
          {renderPagination()}
        </div>

        <div className="min-w-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
          {renderDetailHeader()}
          {mode === MODE_EVENT ? renderEventDetail() : renderUserDetail()}
          {selectedAuditHistory.length > 0 && (
            <div className="border-t border-white/10 px-5 py-4">
              <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-gray-400">Audit History</h3>
              <div className="space-y-2">
                {selectedAuditHistory.slice(-8).reverse().map((entry, index) => (
                  <div key={`${entry.action}-${entry.createdAt}-${index}`} className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-300">
                    <span className="font-bold text-white">{humanize(entry.action)}</span>
                    {entry.message ? <span className="ml-2 text-gray-400">{entry.message}</span> : null}
                    <span className="ml-2 text-gray-500">{formatDateTime(entry.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
