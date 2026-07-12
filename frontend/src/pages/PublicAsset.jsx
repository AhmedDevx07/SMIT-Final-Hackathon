import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";

const PublicAsset = () => {
  const { assetCode } = useParams();
  const [asset, setAsset] = useState(null);
  const [assetHistory, setAssetHistory] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newIssueNumber, setNewIssueNumber] = useState("");

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/assets/public/${assetCode}`);
        setAsset(response.data.asset);
        setAssetHistory(response.data.history || []);
        setMaintenanceRecords(response.data.maintenanceRecords || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load asset details");
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetCode]);

  const handleAnalyze = async () => {
    if (!complaintText.trim()) return;
    try {
      setAiLoading(true);
      const response = await api.post("/issues/triage", {
        assetCode,
        complaintText,
      });
      setAiResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze complaint with AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!aiResult) return;
    try {
      const response = await api.post("/issues/create", {
        assetCode,
        description: complaintText,
        title: aiResult.title,
        category: aiResult.category,
        priority: aiResult.priority,
        possibleCauses: aiResult.possibleCauses,
        initialChecks: aiResult.initialChecks,
        reporterName,
        reporterContact,
        evidenceUrls,
        isAiGenerated: true,
      });
      setNewIssueNumber(response.data.issue.issueNumber);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit report");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Operational":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Under Maintenance":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  const resetForm = () => {
    setShowSuccessModal(false);
    setComplaintText("");
    setReporterName("");
    setReporterContact("");
    setEvidenceUrls("");
    setAiResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Public Asset Portal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Asset {assetCode}
          </h1>
          <p className="mt-2 text-slate-400">
            View asset details and submit maintenance requests
          </p>
        </div>

        {/* Asset Detail Card */}
        <div className="mb-8 rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-48 rounded bg-slate-700 animate-pulse" />
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-2xl bg-slate-700 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : asset ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{asset.name}</h2>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(asset.status)}`}
                >
                  {asset.status}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Asset Code</p>
                  <p className="mt-1 font-semibold text-white">
                    {asset.assetCode}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Location</p>
                  <p className="mt-1 font-semibold text-white">
                    {asset.location}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Condition</p>
                  <p className="mt-1 font-semibold text-white">
                    {asset.condition}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Category</p>
                  <p className="mt-1 font-semibold text-white">
                    {asset.category}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Last Service</p>
                  <p className="mt-1 font-semibold text-white">
                    {asset.lastServiceDate
                      ? new Date(asset.lastServiceDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Next Service</p>
                  <p className="mt-1 font-semibold text-white">
                    {asset.nextServiceDate
                      ? new Date(asset.nextServiceDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Recent Maintenance Records Card */}
        {maintenanceRecords.length > 0 && (
          <div className="mb-8 rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Recent Maintenance
            </h3>
            <div className="space-y-3">
              {maintenanceRecords.map((record) => (
                <div
                  key={record._id}
                  className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Maintenance Performed
                      </p>
                      {record.issue && (
                        <p className="text-sm text-slate-400 mt-1">
                          Issue: {record.issue.issueNumber} -{" "}
                          {record.issue.title}
                        </p>
                      )}
                      {record.actionsPerformed && (
                        <p className="text-sm text-slate-400 mt-1">
                          {record.actionsPerformed}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(record.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Card */}
        <div className="mb-8 rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl bg-slate-700 animate-pulse"
                />
              ))}
            </div>
          ) : assetHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No activity recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {assetHistory.map((entry) => (
                <div
                  key={entry._id}
                  className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-white">{entry.action}</p>
                      {entry.issue && (
                        <p className="text-sm text-slate-400 mt-1">
                          Issue: {entry.issue.issueNumber} - {entry.issue.title}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Triage & Reporting */}
        <div className="space-y-6">
          {/* Complaint Form */}
          <div className="rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Report an Issue
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Contact Info
                  </label>
                  <input
                    type="text"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    className="w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder="Email or phone number"
                  />
                </div>
              </div>
              <textarea
                className="w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none h-32"
                placeholder="Describe the issue you're experiencing..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
              />
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">
                  Evidence URLs (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={evidenceUrls}
                  onChange={(e) => setEvidenceUrls(e.target.value)}
                  className="w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                />
              </div>
              <button
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAnalyze}
                disabled={!complaintText.trim() || aiLoading}
              >
                {aiLoading ? "Analyzing..." : "Analyze with AI"}
              </button>
            </div>
          </div>

          {/* AI Result Skeleton Loader */}
          {aiLoading && (
            <div className="rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6">
              <div className="space-y-4">
                <div className="h-6 w-48 rounded bg-slate-700 animate-pulse" />
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-slate-700 animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Result & Editable Fields */}
          {aiResult && !aiLoading && (
            <div className="rounded-3xl bg-slate-800/50 backdrop-blur-md border-2 border-dashed border-indigo-500/50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-indigo-400 mb-4">
                AI Recommended
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400">Title</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    value={aiResult.title}
                    onChange={(e) =>
                      setAiResult({ ...aiResult, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Category</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    value={aiResult.category}
                    onChange={(e) =>
                      setAiResult({ ...aiResult, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Priority</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    value={aiResult.priority}
                    onChange={(e) =>
                      setAiResult({ ...aiResult, priority: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400">
                    Possible Causes
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none h-24"
                    value={
                      Array.isArray(aiResult.possibleCauses)
                        ? aiResult.possibleCauses.join("\n")
                        : aiResult.possibleCauses
                    }
                    onChange={(e) =>
                      setAiResult({
                        ...aiResult,
                        possibleCauses: e.target.value.split("\n"),
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400">
                    Initial Checks
                  </label>
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none h-24"
                    value={
                      Array.isArray(aiResult.initialChecks)
                        ? aiResult.initialChecks.join("\n")
                        : aiResult.initialChecks
                    }
                    onChange={(e) =>
                      setAiResult({
                        ...aiResult,
                        initialChecks: e.target.value.split("\n"),
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  className="w-full md:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all"
                  onClick={handleSubmitReport}
                >
                  Submit Official Report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
            <div className="max-w-md w-full mx-4 rounded-3xl bg-slate-800 border border-slate-700 p-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                Report Submitted!
              </h3>
              <p className="text-slate-400 text-center mb-6">
                Your issue has been successfully reported.
              </p>
              <div className="rounded-2xl bg-slate-700/50 border border-slate-600 p-4 text-center mb-6">
                <p className="text-sm text-slate-400">Issue Ticket Number</p>
                <p className="text-xl font-bold text-indigo-400">
                  {newIssueNumber}
                </p>
              </div>
              <button
                className="w-full px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all"
                onClick={resetForm}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicAsset;
