import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, RotateCcw, ShieldAlert } from "lucide-react";
import { httpClient } from "@/shared/api/http-client";
import { getApiErrorMessage } from "@/shared/api/api-error";

const formatMinor = (minor = 0, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(minor / 100);

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
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold ${statusTone[status] || "bg-white/5 text-gray-300 border-white/10"}`}>
    {String(status || "unknown").replaceAll("_", " ")}
  </span>
);

export default function RefundManagement() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [refunds, setRefunds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [error, setError] = useState("");

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.id === selectedBatchId) || batches[0] || null,
    [batches, selectedBatchId],
  );

  const loadBatches = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await httpClient.get("/payments/admin/refund-batches");
      const nextBatches = response.data?.data?.batches || [];
      setBatches(nextBatches);
      setSelectedBatchId((current) => current || nextBatches[0]?.id || null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load refund batches."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadBatchDetails = useCallback(async (batchId) => {
    if (!batchId) {
      setRefunds([]);
      return;
    }

    setError("");
    try {
      const response = await httpClient.get(`/payments/admin/refund-batches/${batchId}`);
      setRefunds(response.data?.data?.refunds || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load refund details."));
    }
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    void loadBatchDetails(selectedBatch?.id);
  }, [loadBatchDetails, selectedBatch?.id]);

  const runAction = async (path, label) => {
    if (!window.confirm(`${label}?`)) return;

    setIsActionPending(true);
    setError("");
    try {
      await httpClient.post(path);
      await loadBatches();
      await loadBatchDetails(selectedBatch?.id);
    } catch (err) {
      setError(getApiErrorMessage(err, "Refund action failed."));
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0C0B10] p-6 text-white">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Refund Management</h1>
          <p className="mt-1 text-sm text-gray-400">Event cancellation refund batches and recovery actions.</p>
        </div>
        <button
          type="button"
          onClick={loadBatches}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-gray-200 hover:bg-white/5"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-md border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          <ShieldAlert size={18} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-md border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-black uppercase tracking-wider text-gray-400">
            Batches
          </div>
          {isLoading ? (
            <div className="p-4 text-sm text-gray-400">Loading...</div>
          ) : batches.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">No refund batches.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {batches.map((batch) => {
                const currency = Object.keys(batch.currencySummaries || {})[0] || "usd";
                return (
                  <button
                    type="button"
                    key={batch.id}
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`block w-full px-4 py-3 text-left hover:bg-white/5 ${selectedBatch?.id === batch.id ? "bg-white/5" : ""}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-bold">{batch.eventId}</span>
                      <StatusPill status={batch.status} />
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatMinor(batch.totalCompletedAmountMinor, currency)} / {formatMinor(batch.totalRequestedAmountMinor, currency)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-md border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-black">{selectedBatch ? selectedBatch.eventId : "Select a batch"}</h2>
                {selectedBatch && <StatusPill status={selectedBatch.status} />}
              </div>
              {selectedBatch && (
                <p className="mt-1 text-sm text-gray-400">
                  {selectedBatch.displayReason} · {selectedBatch.succeededCount}/{selectedBatch.totalEligibleOrders} completed
                </p>
              )}
            </div>
            {selectedBatch && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isActionPending}
                  onClick={() => runAction(`/payments/admin/refund-batches/${selectedBatch.id}/reconcile`, "Reconcile this refund batch")}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-gray-200 hover:bg-white/5 disabled:opacity-50"
                >
                  <RefreshCw size={16} />
                  Reconcile
                </button>
                <button
                  type="button"
                  disabled={isActionPending}
                  onClick={() => runAction(`/payments/admin/refund-batches/${selectedBatch.id}/retry`, "Retry eligible failed refunds in this batch")}
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-[#B9FF66] px-4 text-sm font-black text-[#111111] disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Retry
                </button>
                <button
                  type="button"
                  disabled={isActionPending}
                  onClick={() => runAction(`/payments/admin/refund-batches/${selectedBatch.id}/resume`, "Resume this refund batch")}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-bold text-gray-200 hover:bg-white/5 disabled:opacity-50"
                >
                  Resume
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Attempts</th>
                  <th className="px-5 py-3">Tax</th>
                  <th className="px-5 py-3">Stripe Refund</th>
                  <th className="px-5 py-3">Last Error</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {refunds.map((refund) => (
                  <tr key={refund.id}>
                    <td className="px-5 py-4 font-mono text-xs text-gray-300">{refund.checkoutOrderId}</td>
                    <td className="px-5 py-4"><StatusPill status={refund.status} /></td>
                    <td className="px-5 py-4 text-gray-200">{formatMinor(refund.completedAmountMinor, refund.currency)} / {formatMinor(refund.requestedAmountMinor, refund.currency)}</td>
                    <td className="px-5 py-4 text-gray-300">{refund.attemptCount}</td>
                    <td className="px-5 py-4 text-gray-300">
                      {refund.taxReversal ? `${formatMinor(refund.taxReversal.reversedTaxAmountMinor, refund.taxReversal.currency)} ${refund.taxReversal.status}` : "-"}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">{refund.stripeRefundId || "-"}</td>
                    <td className="max-w-[220px] px-5 py-4 text-xs text-gray-400">{refund.safeLastErrorMessage || "-"}</td>
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
                {refunds.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-gray-400">No refund items for this batch.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {selectedBatch?.auditHistory?.length > 0 && (
            <div className="border-t border-white/10 px-5 py-4">
              <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-gray-400">Audit History</h3>
              <div className="space-y-2">
                {selectedBatch.auditHistory.slice(-8).reverse().map((entry, index) => (
                  <div key={`${entry.action}-${entry.createdAt}-${index}`} className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-300">
                    <span className="font-bold text-white">{String(entry.action).replaceAll("_", " ")}</span>
                    {entry.message ? <span className="ml-2 text-gray-400">{entry.message}</span> : null}
                    <span className="ml-2 text-gray-500">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}</span>
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
