import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRAsset, setCurrentQRAsset] = useState(null);
  const [showAssetDetailsModal, setShowAssetDetailsModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetHistory, setAssetHistory] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    condition: "",
    status: "Operational",
    lastServiceDate: "",
    nextServiceDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [assigningIds, setAssigningIds] = useState([]);
  const [activeTab, setActiveTab] = useState("assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [assetFilters, setAssetFilters] = useState({
    status: "",
    category: "",
    location: "",
  });
  const [issueFilters, setIssueFilters] = useState({
    status: "",
    priority: "",
    category: "",
    technician: "",
  });

  const fetchData = async () => {
    try {
      setStatsLoading(true);
      const [assetsRes, issuesRes, usersRes, statsRes] = await Promise.all([
        api.get("/assets", {
          params: {
            ...assetFilters,
            search: searchQuery,
          },
        }),
        api.get("/issues", {
          params: {
            ...issueFilters,
            search: searchQuery,
          },
        }),
        api.get("/users"),
        api.get("/issues/stats"),
      ]);
      setAssets(assetsRes.data);
      setIssues(issuesRes.data);
      setTechnicians(usersRes.data.filter((u) => u.role === "Technician"));
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, assetFilters, issueFilters]);

  // Poll every 5 seconds to refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingAsset) {
        await api.put(`/assets/${editingAsset._id}`, formData);
      } else {
        const res = await api.post("/assets", formData);
        setCurrentQRAsset(res.data.asset);
        setShowQRModal(true);
      }
      fetchData();
      setFormData({
        name: "",
        category: "",
        location: "",
        condition: "",
        status: "Operational",
        lastServiceDate: "",
        nextServiceDate: "",
      });
      setEditingAsset(null);
      setShowAssetModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      category: asset.category,
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      lastServiceDate: asset.lastServiceDate
        ? new Date(asset.lastServiceDate).toISOString().split("T")[0]
        : "",
      nextServiceDate: asset.nextServiceDate
        ? new Date(asset.nextServiceDate).toISOString().split("T")[0]
        : "",
    });
    setShowAssetModal(true);
  };

  const handleOpenAssetDetails = async (asset) => {
    setSelectedAsset(asset);
    setShowAssetDetailsModal(true);
    try {
      setHistoryLoading(true);
      const [historyRes, maintenanceRes] = await Promise.all([
        api.get(`/assets/${asset._id}/history`),
        api.get(`/assets/${asset._id}/maintenance-records`),
      ]);
      setAssetHistory(historyRes.data);
      setMaintenanceRecords(maintenanceRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await api.delete(`/assets/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAssignIssue = async (issueId, technicianId) => {
    try {
      setAssigningIds((prev) => [...prev, issueId]);
      await api.put(`/issues/assign/${issueId}`, {
        assignedTechnician: technicianId,
      });
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningIds((prev) => prev.filter((id) => id !== issueId));
    }
  };

  const qrLabelRef = useRef(null);
  const handleDownloadQR = () => {
    if (!qrLabelRef.current) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const labelWidth = 400;
    const labelHeight = 500;
    canvas.width = labelWidth;
    canvas.height = labelHeight;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, labelWidth, labelHeight);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, labelWidth - 20, labelHeight - 20);

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ENTERPRISE ASSET MANAGEMENT", labelWidth / 2, 50);

    ctx.font = "bold 18px Arial";
    ctx.fillText(currentQRAsset.name, labelWidth / 2, 100);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#475569";
    ctx.fillText(currentQRAsset.assetCode, labelWidth / 2, 130);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, (labelWidth - 250) / 2, 160, 250, 250);
      const link = document.createElement("a");
      link.download = `${currentQRAsset.assetCode}-label.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = currentQRAsset.qrCodeUrl;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Operational":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Under Inspection":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Under Maintenance":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Issue Reported":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Out of Service":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "Retired":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Admin Panel
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                Welcome, {user?.name}
              </h1>
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

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {statsLoading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md p-6"
              >
                <div className="h-4 w-32 bg-slate-700 rounded animate-pulse mb-4"></div>
                <div className="h-10 w-20 bg-slate-700 rounded animate-pulse"></div>
              </div>
            ))
          ) : (
            <>
              <div className="rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md p-6 transition-all duration-300 hover:border-slate-600">
                <p className="text-sm font-semibold text-slate-400">
                  Total Assets
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {stats.totalAssets || 0}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md p-6 transition-all duration-300 hover:border-slate-600">
                <p className="text-sm font-semibold text-slate-400">
                  Open Issues
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {stats.openIssues || 0}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md p-6 transition-all duration-300 hover:border-slate-600">
                <p className="text-sm font-semibold text-slate-400">
                  Resolved Issues
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {stats.resolvedIssues || 0}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md p-6 transition-all duration-300 hover:border-slate-600">
                <p className="text-sm font-semibold text-slate-400">
                  Critical Issues
                </p>
                <p className="mt-2 text-4xl font-bold text-red-400">
                  {stats.criticalIssues || 0}
                </p>
              </div>
              <div className="rounded-3xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md p-6 transition-all duration-300 hover:border-slate-600">
                <p className="text-sm font-semibold text-slate-400">
                  Unassigned Tasks
                </p>
                <p className="mt-2 text-4xl font-bold text-white">
                  {stats.unassignedTasks || 0}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("assets")}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                activeTab === "assets"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              Assets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("issues")}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                activeTab === "issues"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              Issues
            </button>
          </div>
        </div>

        {activeTab === "assets" && (
          <>
            <div className="flex justify-between">
              <div className="flex flex-wrap gap-3">
                <select
                  value={assetFilters.status}
                  onChange={(e) =>
                    setAssetFilters({ ...assetFilters, status: e.target.value })
                  }
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                >
                  <option value="">All Status</option>
                  <option value="Operational">Operational</option>
                  <option value="Issue Reported">Issue Reported</option>
                  <option value="Under Inspection">Under Inspection</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                  <option value="Retired">Retired</option>
                </select>
                <select
                  value={assetFilters.category}
                  onChange={(e) =>
                    setAssetFilters({
                      ...assetFilters,
                      category: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                >
                  <option value="">All Categories</option>
                  {[...new Set(assets.map((a) => a.category))].map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ),
                  )}
                </select>
                <select
                  value={assetFilters.location}
                  onChange={(e) =>
                    setAssetFilters({
                      ...assetFilters,
                      location: e.target.value,
                    })
                  }
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                >
                  <option value="">All Locations</option>
                  {[...new Set(assets.map((a) => a.location))].map(
                    (location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAssetModal(true);
                  setEditingAsset(null);
                  setFormData({
                    name: "",
                    category: "",
                    location: "",
                    condition: "",
                    status: "Operational",
                    lastServiceDate: "",
                    nextServiceDate: "",
                  });
                }}
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-semibold text-white transition-all duration-300"
              >
                + Add Asset
              </button>
            </div>

            <div className="rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Asset Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {statsLoading
                      ? [...Array(3)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4">
                              <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-8 w-32 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                          </tr>
                        ))
                      : assets.map((asset) => (
                          <tr
                            key={asset._id}
                            className="transition-all duration-300 hover:bg-slate-800"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-semibold text-white">
                                {asset.assetCode}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-slate-300">
                                {asset.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-slate-300">
                                {asset.location}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 ${getStatusColor(
                                  asset.status,
                                )}`}
                              >
                                {asset.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssetDetails(asset)}
                                  className="rounded-xl bg-purple-600 hover:bg-purple-700 px-3 py-2 text-xs font-semibold text-white transition-all duration-300"
                                >
                                  Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentQRAsset(asset);
                                    setShowQRModal(true);
                                  }}
                                  className="rounded-xl bg-slate-700 hover:bg-slate-600 px-3 py-2 text-xs font-semibold text-white transition-all duration-300"
                                >
                                  QR
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditAsset(asset)}
                                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition-all duration-300"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAsset(asset._id)}
                                  className="rounded-xl bg-red-600 hover:bg-red-700 px-3 py-2 text-xs font-semibold text-white transition-all duration-300"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "issues" && (
          <>
            <div className="flex gap-3">
              <select
                value={issueFilters.status}
                onChange={(e) =>
                  setIssueFilters({ ...issueFilters, status: e.target.value })
                }
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
              >
                <option value="">All Status</option>
                <option value="Reported">Reported</option>
                <option value="Assigned">Assigned</option>
                <option value="Inspection Started">Inspection Started</option>
                <option value="Under Inspection">Under Inspection</option>
                <option value="Maintenance In Progress">
                  Maintenance In Progress
                </option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              <select
                value={issueFilters.priority}
                onChange={(e) =>
                  setIssueFilters({ ...issueFilters, priority: e.target.value })
                }
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
              >
                <option value="">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <select
                value={issueFilters.technician}
                onChange={(e) =>
                  setIssueFilters({
                    ...issueFilters,
                    technician: e.target.value,
                  })
                }
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
              >
                <option value="">All Technicians</option>
                {technicians.map((tech) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-3xl bg-slate-800/50 backdrop-blur-md border border-slate-700/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Issue Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Asset Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Assigned To
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Assign
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {statsLoading
                      ? [...Array(5)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4">
                              <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-48 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-6 w-24 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="h-10 w-32 bg-slate-700 rounded animate-pulse"></div>
                            </td>
                          </tr>
                        ))
                      : issues.map((issue) => (
                          <tr
                            key={issue._id}
                            className="transition-all duration-300 hover:bg-slate-800"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-semibold text-white">
                                {issue.issueNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-slate-300">
                                {issue.asset?.assetCode}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-slate-300">
                                {issue.title}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-300 ${getPriorityColor(
                                  issue.priority,
                                )}`}
                              >
                                {issue.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-slate-400">
                                {issue.assignedTechnician?.name || "Unassigned"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={issue.assignedTechnician?._id || ""}
                                onChange={(e) =>
                                  handleAssignIssue(issue._id, e.target.value)
                                }
                                disabled={assigningIds.includes(issue._id)}
                                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300 disabled:opacity-50"
                              >
                                <option value="">Select Technician</option>
                                {technicians.map((tech) => (
                                  <option key={tech._id} value={tech._id}>
                                    {tech.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showAssetModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="max-w-lg w-full rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingAsset ? "Edit Asset" : "Register New Asset"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAssetModal(false);
                  setEditingAsset(null);
                }}
                className="text-slate-400 hover:text-white transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
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
            <div className="p-6">
              <form onSubmit={handleAssetSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                    placeholder="e.g. CNC Machine 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                    placeholder="e.g. Manufacturing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                    placeholder="e.g. Workshop A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Condition
                  </label>
                  <input
                    type="text"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                    placeholder="e.g. Good"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Issue Reported">Issue Reported</option>
                    <option value="Under Inspection">Under Inspection</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Last Service Date
                  </label>
                  <input
                    type="date"
                    name="lastServiceDate"
                    value={formData.lastServiceDate}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">
                    Next Service Date
                  </label>
                  <input
                    type="date"
                    name="nextServiceDate"
                    value={formData.nextServiceDate}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssetModal(false);
                      setEditingAsset(null);
                    }}
                    className="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : editingAsset
                        ? "Update Asset"
                        : "Register Asset"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showQRModal && currentQRAsset && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="max-w-lg w-full rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Asset QR Label</h3>
              <button
                type="button"
                onClick={() => {
                  setShowQRModal(false);
                  setCurrentQRAsset(null);
                }}
                className="text-slate-400 hover:text-white transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
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
            <div className="p-6">
              <div
                ref={qrLabelRef}
                className="rounded-2xl border-2 border-dashed border-indigo-500/50 bg-slate-700/50 p-6 mb-6"
              >
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                    ENTERPRISE ASSET MANAGEMENT
                  </p>
                  <p className="text-lg font-bold text-white mb-2">
                    {currentQRAsset.name}
                  </p>
                  <p className="text-sm text-slate-400 mb-6">
                    {currentQRAsset.assetCode}
                  </p>
                  <img
                    src={currentQRAsset.qrCodeUrl}
                    alt="QR Code"
                    className="mx-auto w-48 h-48 bg-white rounded-xl p-2"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const publicUrl = `${window.location.origin}/asset/${currentQRAsset.assetCode}`;
                    navigator.clipboard
                      .writeText(publicUrl)
                      .then(() => {
                        alert("Public link copied to clipboard!");
                      })
                      .catch((err) => {
                        console.error("Failed to copy link: ", err);
                      });
                  }}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-sm font-semibold text-white transition-all duration-300"
                >
                  Copy Public Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const publicUrl = `${window.location.origin}/asset/${currentQRAsset.assetCode}`;
                    window.open(publicUrl, "_blank");
                  }}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition-all duration-300"
                >
                  Open Public Page
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-all duration-300"
                >
                  Download QR Label
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowQRModal(false);
                    setCurrentQRAsset(null);
                  }}
                  className="flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssetDetailsModal && selectedAsset && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-800 border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedAsset.name}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedAsset.assetCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAssetDetailsModal(false);
                  setSelectedAsset(null);
                  setAssetHistory([]);
                }}
                className="text-slate-400 hover:text-white transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
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
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Category</p>
                  <p className="mt-1 font-semibold text-white">
                    {selectedAsset.category}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Location</p>
                  <p className="mt-1 font-semibold text-white">
                    {selectedAsset.location}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Condition</p>
                  <p className="mt-1 font-semibold text-white">
                    {selectedAsset.condition}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                  <p className="text-sm text-slate-400">Status</p>
                  <p
                    className={`mt-1 font-semibold ${getStatusColor(selectedAsset.status)}`}
                  >
                    {selectedAsset.status}
                  </p>
                </div>
                {selectedAsset.lastServiceDate && (
                  <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                    <p className="text-sm text-slate-400">Last Service</p>
                    <p className="mt-1 font-semibold text-white">
                      {new Date(
                        selectedAsset.lastServiceDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedAsset.nextServiceDate && (
                  <div className="rounded-2xl bg-slate-700/50 p-4 border border-slate-600">
                    <p className="text-sm text-slate-400">Next Service</p>
                    <p className="mt-1 font-semibold text-white">
                      {new Date(
                        selectedAsset.nextServiceDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  History
                </h4>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 rounded-2xl bg-slate-700 animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : assetHistory.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl bg-slate-700/50 border border-slate-600">
                    <p className="text-slate-400">No activity yet</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4">
                    {assetHistory.map((entry, index) => (
                      <div key={entry._id} className="relative">
                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-500"></div>
                        <div className="rounded-2xl bg-slate-700/50 border border-slate-600 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-white">
                              {entry.action}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(entry.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {entry.actor && (
                            <p className="text-sm text-slate-400">
                              By: {entry.actor.name} ({entry.actor.email})
                            </p>
                          )}
                          {entry.issue && (
                            <p className="text-sm text-slate-300 mt-1">
                              Issue: {entry.issue.issueNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">
                  Maintenance Records
                </h4>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 rounded-2xl bg-slate-700 animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : maintenanceRecords.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl bg-slate-700/50 border border-slate-600">
                    <p className="text-slate-400">No maintenance records yet</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4">
                    {maintenanceRecords.map((record, index) => (
                      <div key={record._id} className="relative">
                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div className="rounded-2xl bg-slate-700/50 border border-slate-600 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-white">
                              Maintenance Performed
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(record.completedAt).toLocaleString()}
                            </p>
                          </div>
                          {record.issue && (
                            <p className="text-sm text-slate-400">
                              Issue: {record.issue.issueNumber} -{" "}
                              {record.issue.title}
                            </p>
                          )}
                          {record.inspectionNotes && (
                            <p className="text-sm text-slate-300 mt-1">
                              <span className="font-semibold">
                                Inspection Notes:
                              </span>{" "}
                              {record.inspectionNotes}
                            </p>
                          )}
                          {record.actionsPerformed && (
                            <p className="text-sm text-slate-300 mt-1">
                              <span className="font-semibold">
                                Actions Performed:
                              </span>{" "}
                              {record.actionsPerformed}
                            </p>
                          )}
                          {record.partsReplaced &&
                            record.partsReplaced.length > 0 && (
                              <p className="text-sm text-slate-300 mt-1">
                                <span className="font-semibold">
                                  Parts Replaced:
                                </span>{" "}
                                {record.partsReplaced.join(", ")}
                              </p>
                            )}
                          {record.cost > 0 && (
                            <p className="text-sm text-slate-300 mt-1">
                              <span className="font-semibold">Cost:</span> $
                              {record.cost.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
