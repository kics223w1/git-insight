import { useState, useEffect } from "react";
import { GitLog } from "../../services/GitLogService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale,
} from "chart.js";
import { Bar, Line, Pie, PolarArea } from "react-chartjs-2";
import "chart.js/auto";
import "../../styles/GitCharts.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Title,
  Tooltip,
  Legend
);

interface GitChartsProps {
  gitLogs: GitLog[];
}

const GitCharts: React.FC<GitChartsProps> = ({ gitLogs }) => {
  const [activeTab, setActiveTab] = useState("timeline");
  const [filteredLogs, setFilteredLogs] = useState<GitLog[]>(gitLogs);

  // Date range state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (gitLogs && gitLogs.length > 0) {
      // Set initial date range to cover all commits
      const dates = gitLogs.map((log) => log.date);
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      // Format dates for input[type="date"]
      setStartDate(formatDateForInput(minDate));
      setEndDate(formatDateForInput(maxDate));

      // Initial filtering
      filterLogsByDateRange(gitLogs, minDate, maxDate);
    }
  }, [gitLogs]);

  // Format date for date input (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Handle date range changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Filter logs based on new date range
    const startTimestamp = new Date(newStartDate).getTime();
    const endTimestamp = endDate ? new Date(endDate).getTime() : Infinity;

    filterLogsByDateRange(
      gitLogs,
      new Date(startTimestamp),
      new Date(endTimestamp)
    );
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // Filter logs based on new date range
    const startTimestamp = startDate ? new Date(startDate).getTime() : 0;
    const endTimestamp = new Date(newEndDate);
    // Set end date to the end of the day
    endTimestamp.setHours(23, 59, 59, 999);

    filterLogsByDateRange(gitLogs, new Date(startTimestamp), endTimestamp);
  };

  // Filter logs by date range
  const filterLogsByDateRange = (logs: GitLog[], start: Date, end: Date) => {
    const filtered = logs.filter((log) => {
      const commitDate = new Date(log.date);
      return commitDate >= start && commitDate <= end;
    });

    setFilteredLogs(filtered);
  };

  // Reset date filter
  const resetDateFilter = () => {
    if (gitLogs && gitLogs.length > 0) {
      const dates = gitLogs.map((log) => log.date);
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      setStartDate(formatDateForInput(minDate));
      setEndDate(formatDateForInput(maxDate));
      setFilteredLogs(gitLogs);
    }
  };

  // Skip rendering if no data
  if (!gitLogs || gitLogs.length === 0) {
    return null;
  }

  // ---- Data Preparation Functions ----

  // 1. Commits by Author
  const prepareAuthorData = () => {
    const authorMap = new Map<string, number>();

    filteredLogs.forEach((log) => {
      const count = authorMap.get(log.author) || 0;
      authorMap.set(log.author, count + 1);
    });

    // Sort by commit count descending
    const sortedAuthors = [...authorMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Limit to top 10 authors

    return {
      labels: sortedAuthors.map(([author]) => author),
      datasets: [
        {
          label: "Commits",
          data: sortedAuthors.map(([, count]) => count),
          backgroundColor: [
            "rgba(199, 146, 234, 0.7)",
            "rgba(125, 196, 228, 0.7)",
            "rgba(138, 227, 174, 0.7)",
            "rgba(245, 199, 112, 0.7)",
            "rgba(230, 126, 126, 0.7)",
            "rgba(159, 145, 240, 0.7)",
            "rgba(120, 210, 200, 0.7)",
            "rgba(230, 165, 120, 0.7)",
            "rgba(190, 190, 190, 0.7)",
            "rgba(200, 140, 180, 0.7)",
          ],
          borderColor: [
            "rgba(199, 146, 234, 1)",
            "rgba(125, 196, 228, 1)",
            "rgba(138, 227, 174, 1)",
            "rgba(245, 199, 112, 1)",
            "rgba(230, 126, 126, 1)",
            "rgba(159, 145, 240, 1)",
            "rgba(120, 210, 200, 1)",
            "rgba(230, 165, 120, 1)",
            "rgba(190, 190, 190, 1)",
            "rgba(200, 140, 180, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 2. Commits Over Time (Timeline)
  const prepareTimelineData = () => {
    // Group commits by day
    const dateMap = new Map<string, number>();

    filteredLogs.forEach((log) => {
      const date = new Date(log.date).toISOString().split("T")[0];
      const count = dateMap.get(date) || 0;
      dateMap.set(date, count + 1);
    });

    // Sort dates chronologically
    const sortedDates = [...dateMap.entries()].sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    return {
      labels: sortedDates.map(([date]) => date),
      datasets: [
        {
          label: "Commits",
          data: sortedDates.map(([, count]) => count),
          fill: false,
          borderColor: "rgba(125, 196, 228, 1)",
          backgroundColor: "rgba(125, 196, 228, 0.2)",
          tension: 0.4,
          pointBackgroundColor: "rgba(125, 196, 228, 1)",
        },
      ],
    };
  };

  // 3. Commit Distribution by Hour
  const prepareHourlyData = () => {
    // Initialize hours array (0-23)
    const hours = Array(24).fill(0);

    filteredLogs.forEach((log) => {
      const hour = new Date(log.date).getHours();
      hours[hour]++;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: "Commits by Hour",
          data: hours,
          backgroundColor: "rgba(199, 146, 234, 0.7)",
          borderColor: "rgba(199, 146, 234, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // 4. Commit Distribution by Day of Week
  const prepareDayOfWeekData = () => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const days = Array(7).fill(0);

    filteredLogs.forEach((log) => {
      const day = new Date(log.date).getDay();
      days[day]++;
    });

    return {
      labels: dayNames,
      datasets: [
        {
          label: "Commits by Day",
          data: days,
          backgroundColor: "rgba(138, 227, 174, 0.7)",
          borderColor: "rgba(138, 227, 174, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // 5. Commit Message Length Distribution
  const prepareMessageLengthData = () => {
    // Categories for message length
    const categories = [
      "Very Short (<10)",
      "Short (10-50)",
      "Medium (51-100)",
      "Long (101-500)",
      "Very Long (>500)",
    ];
    const counts = [0, 0, 0, 0, 0];

    filteredLogs.forEach((log) => {
      const length = log.message.length;
      if (length < 10) counts[0]++;
      else if (length <= 50) counts[1]++;
      else if (length <= 100) counts[2]++;
      else if (length <= 500) counts[3]++;
      else counts[4]++;
    });

    return {
      labels: categories,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            "rgba(245, 199, 112, 0.7)",
            "rgba(230, 126, 126, 0.7)",
            "rgba(159, 145, 240, 0.7)",
            "rgba(120, 210, 200, 0.7)",
            "rgba(230, 165, 120, 0.7)",
          ],
          borderColor: [
            "rgba(245, 199, 112, 1)",
            "rgba(230, 126, 126, 1)",
            "rgba(159, 145, 240, 1)",
            "rgba(120, 210, 200, 1)",
            "rgba(230, 165, 120, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 6. Author Activity Distribution (Polar Area)
  const prepareAuthorActivityData = () => {
    const authorMap = new Map<string, number>();

    filteredLogs.forEach((log) => {
      const count = authorMap.get(log.author) || 0;
      authorMap.set(log.author, count + 1);
    });

    // Get top 8 contributors for better visualization
    const sortedAuthors = [...authorMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      labels: sortedAuthors.map(([author]) => author),
      datasets: [
        {
          data: sortedAuthors.map(([, count]) => count),
          backgroundColor: [
            "rgba(199, 146, 234, 0.7)",
            "rgba(125, 196, 228, 0.7)",
            "rgba(138, 227, 174, 0.7)",
            "rgba(245, 199, 112, 0.7)",
            "rgba(230, 126, 126, 0.7)",
            "rgba(159, 145, 240, 0.7)",
            "rgba(120, 210, 200, 0.7)",
            "rgba(230, 165, 120, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      title: {
        display: true,
        text: "Git Repository Analysis",
        color: "rgba(255, 255, 255, 0.8)",
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  const lineOptions = {
    ...barOptions,
    scales: {
      ...barOptions.scales,
      x: {
        ...barOptions.scales.x,
        title: {
          display: true,
          text: "Date",
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      y: {
        ...barOptions.scales.y,
        title: {
          display: true,
          text: "Number of Commits",
          color: "rgba(255, 255, 255, 0.8)",
        },
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      },
    },
  };

  const polarAreaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      },
    },
    scales: {
      r: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        angleLines: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="git-charts-container">
      <h2>Git Repository Analytics</h2>
      <p className="git-stats-summary">
        Total Commits: <strong>{filteredLogs.length}</strong> | Authors:{" "}
        <strong>{new Set(filteredLogs.map((log) => log.author)).size}</strong> |
        Time Range:{" "}
        <strong>
          {new Date(
            Math.min(...filteredLogs.map((log) => log.date))
          ).toLocaleDateString()}
        </strong>{" "}
        to{" "}
        <strong>
          {new Date(
            Math.max(...filteredLogs.map((log) => log.date))
          ).toLocaleDateString()}
        </strong>
        {filteredLogs.length !== gitLogs.length && (
          <span className="filter-badge"> (Filtered)</span>
        )}
      </p>

      <div className="date-range-picker">
        <div className="date-range-inputs">
          <div className="date-input-group">
            <label htmlFor="start-date">From:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>

          <div className="date-input-group">
            <label htmlFor="end-date">To:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>
        </div>

        <button
          className="reset-filter-btn"
          onClick={resetDateFilter}
          title="Reset to full date range"
        >
          Reset
        </button>
      </div>

      <div className="chart-tabs">
        <button
          className={`chart-tab ${activeTab === "timeline" ? "active" : ""}`}
          onClick={() => setActiveTab("timeline")}
        >
          Timeline
        </button>
        <button
          className={`chart-tab ${activeTab === "authors" ? "active" : ""}`}
          onClick={() => setActiveTab("authors")}
        >
          Authors
        </button>
        <button
          className={`chart-tab ${activeTab === "hourly" ? "active" : ""}`}
          onClick={() => setActiveTab("hourly")}
        >
          By Hour
        </button>
        <button
          className={`chart-tab ${activeTab === "weekly" ? "active" : ""}`}
          onClick={() => setActiveTab("weekly")}
        >
          By Day
        </button>
        <button
          className={`chart-tab ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </button>
        <button
          className={`chart-tab ${activeTab === "polar" ? "active" : ""}`}
          onClick={() => setActiveTab("polar")}
        >
          Contributors
        </button>
      </div>

      <div className="chart-container">
        {activeTab === "timeline" && (
          <>
            <h3>Commit Activity Over Time</h3>
            <div className="chart-wrapper">
              <Line data={prepareTimelineData()} options={lineOptions} />
            </div>
          </>
        )}

        {activeTab === "authors" && (
          <>
            <h3>Commits by Author</h3>
            <div className="chart-wrapper">
              <Bar data={prepareAuthorData()} options={barOptions} />
            </div>
          </>
        )}

        {activeTab === "hourly" && (
          <>
            <h3>Commit Distribution by Hour of Day</h3>
            <div className="chart-wrapper">
              <Bar data={prepareHourlyData()} options={barOptions} />
            </div>
          </>
        )}

        {activeTab === "weekly" && (
          <>
            <h3>Commit Distribution by Day of Week</h3>
            <div className="chart-wrapper">
              <Bar data={prepareDayOfWeekData()} options={barOptions} />
            </div>
          </>
        )}

        {activeTab === "messages" && (
          <>
            <h3>Commit Message Length Distribution</h3>
            <div className="chart-wrapper">
              <Pie data={prepareMessageLengthData()} options={pieOptions} />
            </div>
          </>
        )}

        {activeTab === "polar" && (
          <>
            <h3>Contributor Distribution</h3>
            <div className="chart-wrapper">
              <PolarArea
                data={prepareAuthorActivityData()}
                options={polarAreaOptions}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GitCharts;
