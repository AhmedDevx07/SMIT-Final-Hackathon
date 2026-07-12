import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const TechDashboard = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState([]);
  const [celebratingId, setCelebratingId] = useState(null);
  const [showAlert, setShowAlert] = useState(null);

  // Fetch issues
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const res = await api.get("/issues");
        // Filter issues assigned to current technician
        const assignedIssues = res.data.filter(
          (issue) =>
            issue.assignedTechnician?._id === user?.id &&
            issue.status !== "Resolved" &&
            issue.status !== "Closed",
        );
        setIssues(assignedIssues);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [user]);

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  // Handle form change for an issue
  const handleFormChange = (issueId, field, value) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue._id === issueId ? { ...issue, [field]: value } : issue,
      ),
    );
  };

  // Handle status update
  const handleUpdateStatus = async (issueId) => {
    try {
      setUpdatingIds((prev) => [...prev, issueId]);
      const issue = issues.find((i) => i._id === issueId);
      const res = await api.put(`/issues/status/${issueId}`, {
        status: issue.status,
        maintenanceNotes: issue.maintenanceNotes || "",
        cost: issue.cost || 0,
        inspectionNotes: issue.inspectionNotes || "",
        actionsPerformed: issue.actionsPerformed || "",
        partsReplaced: issue.partsReplaced || [],
        evidenceUrls: issue.evidenceUrls || [],
        completedAt: issue.completedAt || new Date().toISOString(),
        nextServiceDate: issue.nextServiceDate || null,
      });

      if (issue.status === "Resolved") {
        // Celebration animation
        setCelebratingId(issueId);
        setTimeout(() => {
          // Remove from active queue
          setIssues((prev) => prev.filter((i) => i._id !== issueId));
          setCelebratingId(null);
          // Show confirmation alert
          setShowAlert({
            type: "success",
            title: "Issue Resolved!",
            message: `Asset ${issue.asset?.assetCode} is now operational.`,
          });
          setTimeout(() => setShowAlert(null), 5000);
        }, 1500);
      } else {
        // Refresh issues (optional, just update local state)
        const issuesRes = await api.get("/issues");
        const assignedIssues = issuesRes.data.filter(
          (i) =>
            i.assignedTechnician?._id === user?.id &&
            i.status !== "Resolved" &&
            i.status !== "Closed",
        );
        setIssues(assignedIssues);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== issueId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Technician Panel
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Welcome, {user?.name}
              </h1>
              <p className="mt-2 text-slate-400">
                Review assigned maintenance jobs and update issue progress.
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl bg-slate-700 hover:bg-slate-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Task Overview Feed */}
        <div className="space-y-4">
          {loading ? (
            // Skeleton loaders
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-slate-800/60 border border-slate-700 backdrop-blur-md p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-slate-700 rounded animate-pulse ml-auto"></div>
                </div>
                <div className="h-6 w-64 bg-slate-700 rounded animate-pulse mb-4"></div>
                <div className="h-24 w-full bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))
          ) : issues.length === 0 ? (
            // Empty state
            <div className="rounded-3xl bg-slate-800/60 border border-slate-700 backdrop-blur-md p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                All Caught Up!
              </h3>
              <p className="text-slate-400">
                No active tasks assigned to you right now.
              </p>
            </div>
          ) : (
            // Issue cards
            issues.map((issue) => (
              <div
                key={issue._id}
                className={`rounded-3xl bg-slate-800/60 border border-slate-700 backdrop-blur-md p-6 transition-all duration-300 ${
                  celebratingId === issue._id
                    ? "ring-2 ring-emerald-500 scale-[1.02]"
                    : ""
                }`}
              >
                {celebratingId === issue._id ? (
                  // Celebration overlay
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                      <svg
                        className="w-12 h-12 text-emerald-400 animate-bounce"
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
                    <p className="text-xl font-bold text-emerald-400">
                      Issue Resolved!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-sm font-semibold text-slate-400">
                        {issue.issueNumber}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {issue.asset?.assetCode}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ml-auto transition-all duration-300 ${getPriorityColor(
                          issue.priority,
                        )}`}
                      >
                        {issue.priority}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-6">
                      {issue.title}
                    </h3>
                    <div className="space-y-4">
                      {/* Status Dropdown */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">
                          Status
                        </label>
                        <select
                          value={issue.status}
                          onChange={(e) =>
                            handleFormChange(
                              issue._id,
                              "status",
                              e.target.value,
                            )
                          }
                          disabled={updatingIds.includes(issue._id)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50"
                        >
                          <option value="Assigned">Assigned</option>
                          <option value="Inspection Started">
                            Inspection Started
                          </option>
                          <option value="Under Inspection">
                            Under Inspection
                          </option>
                          <option value="Maintenance In Progress">
                            Maintenance In Progress
                          </option>
                          <option value="Under Maintenance">
                            Under Maintenance
                          </option>
                          <option value="Waiting for Parts">
                            Waiting for Parts
                          </option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                          <option value="Reopened">Reopened</option>
                        </select>
                      </div>

                      {/* Fields shown when resolving */}
                      {issue.status === "Resolved" && (
                        <>
                          {/* Inspection Notes */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">
                              Inspection Notes{" "}
                              <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={issue.inspectionNotes || ""}
                              onChange={(e) =>
                                handleFormChange(
                                  issue._id,
                                  "inspectionNotes",
                                  e.target.value,
                                )
                              }
                              disabled={updatingIds.includes(issue._id)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50 resize-none h-24"
                              placeholder="Describe what was found during inspection..."
                            />
                          </div>

                          {/* Actions Performed */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">
                              Actions Performed{" "}
                              <span className="text-red-400">*</span>
                            </label>
                            <textarea
                              value={issue.actionsPerformed || ""}
                              onChange={(e) =>
                                handleFormChange(
                                  issue._id,
                                  "actionsPerformed",
                                  e.target.value,
                                )
                              }
                              disabled={updatingIds.includes(issue._id)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50 resize-none h-24"
                              placeholder="Describe what actions were taken to fix the issue..."
                            />
                          </div>

                          {/* Parts Replaced */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">
                              Parts Replaced (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={(issue.partsReplaced || []).join(", ")}
                              onChange={(e) =>
                                handleFormChange(
                                  issue._id,
                                  "partsReplaced",
                                  e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                )
                              }
                              disabled={updatingIds.includes(issue._id)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50"
                              placeholder="Part 1, Part 2, Part 3"
                            />
                          </div>

                          {/* Evidence URLs */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">
                              Evidence URLs (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={(issue.evidenceUrls || []).join(", ")}
                              onChange={(e) =>
                                handleFormChange(
                                  issue._id,
                                  "evidenceUrls",
                                  e.target.value
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                )
                              }
                              disabled={updatingIds.includes(issue._id)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50"
                              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                            />
                          </div>

                          {/* Completed Date */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">
                              Completed Date
                            </label>
                            <input
                              type="datetime-local"
                              value={
                                issue.completedAt
                                  ? new Date(issue.completedAt)
                                      .toISOString()
                                      .slice(0, 16)
                                  : new Date().toISOString().slice(0, 16)
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  issue._id,
                                  "completedAt",
                                  e.target.value,
                                )
                              }
                              disabled={updatingIds.includes(issue._id)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50"
                            />
                          </div>

                          {/* Next Service Date */}
                          <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">
                              Next Service Date
                            </label>
                            <input
                              type="date"
                              value={
                                issue.nextServiceDate
                                  ? new Date(issue.nextServiceDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={(e) =>
                                handleFormChange(
                                  issue._id,
                                  "nextServiceDate",
                                  e.target.value,
                                )
                              }
                              disabled={updatingIds.includes(issue._id)}
                              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50"
                            />
                          </div>
                        </>
                      )}

                      {/* Maintenance Notes */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">
                          Maintenance Notes
                        </label>
                        <textarea
                          value={issue.maintenanceNotes || ""}
                          onChange={(e) =>
                            handleFormChange(
                              issue._id,
                              "maintenanceNotes",
                              e.target.value,
                            )
                          }
                          disabled={updatingIds.includes(issue._id)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50 resize-none h-24"
                          placeholder="Add notes about the maintenance performed..."
                        />
                      </div>

                      {/* Cost Input */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">
                          Cost (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={issue.cost || ""}
                            onChange={(e) =>
                              handleFormChange(
                                issue._id,
                                "cost",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            disabled={updatingIds.includes(issue._id)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-8 pr-4 py-3 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all duration-300 disabled:opacity-50"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Update Button */}
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(issue._id)}
                        disabled={updatingIds.includes(issue._id)}
                        className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-300 disabled:opacity-50"
                      >
                        {updatingIds.includes(issue._id)
                          ? "Updating..."
                          : "Update Status"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className="rounded-2xl bg-emerald-600 border border-emerald-500/50 p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-emerald-300"
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
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white">
                    {showAlert.title}
                  </h4>
                  <p className="text-emerald-200 mt-1">{showAlert.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAlert(null)}
                  className="text-emerald-200 hover:text-white transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechDashboard;
