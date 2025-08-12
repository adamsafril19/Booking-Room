import React, { useState } from "react";
import { reportingApi } from "../api/api";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { FaExclamationCircle, FaInfoCircle, FaSpinner } from "react-icons/fa";

const Reports: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, token } = useAuth();

  const handleDownload = async (format: "pdf" | "xlsx") => {
    if (!fromDate || !toDate) {
      setError("Please select both from and to dates");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError("To Date cannot be earlier than From Date");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await reportingApi.get("/reports/usage", {
        params: {
          from: fromDate,
          to: toDate,
          format: format,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          ...(user && user.id ? { "X-User-Id": user.id } : {}),
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `usage-report-${fromDate}-to-${toDate}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Failed to download ${format.toUpperCase()} report`
      );
    } finally {
      setLoading(false);
    }
  };
  console.log("Token being sent:", token);
console.log("User ID being sent:", user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <Link to="/dashboard">
              <Button variant="secondary">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Usage Report Generator
                </h2>
                <p className="text-gray-600 mb-6">
                  Generate usage reports for room bookings within a specified
                  date range.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                  <FaExclamationCircle className="mr-2" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fromDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    From Date
                  </label>
                  <Input
                    id="fromDate"
                    name="fromDate"
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="mt-1"
                    aria-label="From Date"
                  />
                </div>

                <div>
                  <label
                    htmlFor="toDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    To Date
                  </label>
                  <Input
                    id="toDate"
                    name="toDate"
                    type="date"
                    required
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="mt-1"
                    aria-label="To Date"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleDownload("pdf")}
                  disabled={loading || !fromDate || !toDate}
                  className="flex-1 flex items-center justify-center transition duration-200 ease-in-out"
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                  Download PDF Report
                </Button>
                <Button
                  onClick={() => handleDownload("xlsx")}
                  disabled={loading || !fromDate || !toDate}
                  variant="secondary"
                  className="flex-1 flex items-center justify-center transition duration-200 ease-in-out"
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                  Download XLSX Report
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <FaInfoCircle className="mr-2" />
                  Report Information
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • Reports include all room bookings within the selected date
                    range
                  </li>
                  <li>
                    • PDF reports are formatted for easy reading and printing
                  </li>
                  <li>
                    • XLSX reports include detailed data for further analysis
                  </li>
                  <li>
                    • Reports are generated in real-time based on current
                    booking data
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
