import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../services/apiconnector";
import toast from "react-hot-toast";

const BASE = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";
const headers = (token) => ({ Authorization: `Bearer ${token}` });

export default function PaymentHistory() {
  const { token } = useSelector((s) => s.auth);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiConnector("GET", `${BASE}/payment/history?page=${page}&limit=10`, null, headers(token));
      setRecords(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error("Failed to load payment history"); }
    finally { setLoading(false); }
  }, [token, page]);

  useEffect(() => { load(); }, [load]);

  const downloadInvoice = async (paymentId, orderId) => {
    try {
      const res = await apiConnector("GET", `${BASE}/payment/invoice/${paymentId}`, null, {
        ...headers(token),
        "Content-Type": "application/json",
      }, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error("Failed to download invoice"); }
  };

  const submitRefund = async () => {
    try {
      await apiConnector("POST", `${BASE}/payment/refund/${refundModal}`, { reason: refundReason }, headers(token));
      toast.success("Refund initiated successfully");
      setRefundModal(null);
      setRefundReason("");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Refund failed");
    }
  };

  const STATUS_COLORS = {
    paid: "bg-green-900 text-green-200",
    created: "bg-blue-900 text-blue-200",
    refunded: "bg-orange-900 text-orange-200",
    failed: "bg-red-900 text-red-200",
  };

  return (
    <div className="min-h-screen bg-richblack-900 text-white px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-richblack-5">Payment History</h1>

      {loading ? (
        <div className="text-center text-richblack-300 py-10">Loading…</div>
      ) : records.length === 0 ? (
        <div className="text-center text-richblack-400 py-10">No payment records found.</div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record._id} className="bg-richblack-800 rounded-xl p-5 border border-richblack-700">
              <div className="flex flex-wrap justify-between items-start gap-4">
                {/* Course list */}
                <div className="flex-1 min-w-0">
                  <div className="flex gap-3 flex-wrap mb-2">
                    {record.courses?.map((c) => (
                      <div key={c._id} className="flex items-center gap-2">
                        <img src={c.thumbnail} alt="" className="w-10 h-7 rounded object-cover" />
                        <span className="text-white text-sm">{c.courseName}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-richblack-400 text-xs">
                    Order: {record.razorpay_order_id} &bull; {new Date(record.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>

                {/* Amount + status */}
                <div className="text-right shrink-0">
                  <p className="text-yellow-50 font-bold text-lg">₹{(record.amount / 100).toFixed(2)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[record.status]}`}>
                    {record.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => downloadInvoice(record._id, record.razorpay_order_id)}
                  className="text-sm px-3 py-1.5 rounded-lg bg-richblack-700 hover:bg-richblack-600 transition"
                >
                  Download Invoice
                </button>
                {record.status === "paid" && (
                  <button
                    onClick={() => setRefundModal(record._id)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-700 text-red-200 transition"
                  >
                    Request Refund
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between text-richblack-300 text-sm pt-2">
            <span>{total} total payments</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-richblack-700 disabled:opacity-40">Prev</button>
              <span className="px-3 py-1">{page}</span>
              <button disabled={page * 10 >= total} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-richblack-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-richblack-800 rounded-xl p-6 w-full max-w-md border border-richblack-600">
            <h2 className="text-white font-bold text-lg mb-3">Request Refund</h2>
            <p className="text-richblack-300 text-sm mb-4">Please provide a reason for the refund.</p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={3}
              placeholder="Reason for refund…"
              className="w-full bg-richblack-700 text-white rounded-lg px-3 py-2 text-sm outline-none resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRefundModal(null)}
                className="px-4 py-2 rounded-lg bg-richblack-700 text-sm hover:bg-richblack-600 transition">
                Cancel
              </button>
              <button onClick={submitRefund}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm transition">
                Submit Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
