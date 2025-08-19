import React, { useState } from "react";
import { reportingApi } from "../api/api";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import {
  FaExclamationCircle,
  FaInfoCircle,
  FaSpinner,
  FaFilePdf,
  FaFileExcel,
  FaCalendarAlt,
  FaChartBar,
  FaDownload,
  FaArrowLeft,
} from "react-icons/fa";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-xl">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-lg">
                <FaChartBar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Reports</h1>
                <p className="text-purple-100 mt-1">
                  Generate usage analytics and insights
                </p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button
                variant="secondary"
                className="bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/30 transition-all duration-300"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          {/* Report Generator Section */}
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <FaCalendarAlt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Usage Report Generator
                  </h2>
                  <p className="text-purple-100 mt-1">
                    Generate comprehensive analytics for room utilization
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center shadow-md">
                  <div className="p-2 bg-red-100 rounded-full mr-4">
                    <FaExclamationCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Error</h4>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <FaCalendarAlt className="h-4 w-4 text-purple-600" />
                  </div>
                  Select Date Range
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="fromDate"
                      className="block text-sm font-medium text-purple-700"
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
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      aria-label="From Date"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="toDate"
                      className="block text-sm font-medium text-purple-700"
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
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      aria-label="To Date"
                    />
                  </div>
                </div>
              </div>

              {/* Download Actions */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <FaDownload className="h-4 w-4 text-indigo-600" />
                  </div>
                  Download Reports
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleDownload("pdf")}
                    disabled={loading || !fromDate || !toDate}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 py-4"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin h-5 w-5" />
                    ) : (
                      <FaFilePdf className="h-5 w-5" />
                    )}
                    <span className="font-medium">Download PDF Report</span>
                  </Button>

                  <Button
                    onClick={() => handleDownload("xlsx")}
                    disabled={loading || !fromDate || !toDate}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 py-4"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin h-5 w-5" />
                    ) : (
                      <FaFileExcel className="h-5 w-5" />
                    )}
                    <span className="font-medium">Download Excel Report</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Information Card */}
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <FaInfoCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Report Information
                  </h3>
                  <p className="text-blue-100 mt-1">
                    Understanding your reports
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-800 flex items-center">
                    <FaFilePdf className="mr-2 text-red-500" />
                    PDF Reports
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Formatted for easy reading and printing
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Visual charts and summary statistics
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Professional presentation format
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-800 flex items-center">
                    <FaFileExcel className="mr-2 text-green-500" />
                    Excel Reports
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Detailed data for further analysis
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Customizable tables and filters
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Compatible with Excel and Google Sheets
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 flex items-center">
                  <FaChartBar className="mr-2 text-blue-500" />
                  Reports include all room bookings within the selected date
                  range and are generated in real-time based on current booking
                  data.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
