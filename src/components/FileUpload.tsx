import { useState, useRef } from "react";
import "../styles/FileUpload.css";
import GitLogService, { GitLog } from "../services/GitLogService";
import GitCharts from "./charts/GitCharts";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [gitLogs, setGitLogs] = useState<GitLog[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [parseStatus, setParseStatus] = useState<
    "none" | "empty" | "success" | "error"
  >("none");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the GitLogService instance
  const gitLogService = GitLogService.getInstance();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File | undefined) => {
    setErrorMessage("");
    setUploadStatus("");
    setGitLogs([]);
    setShowCharts(false);
    setParseStatus("none");

    if (!selectedFile) return;

    // Check if file is a text file
    if (!selectedFile.name.endsWith(".txt")) {
      setErrorMessage("Please upload a .txt file");
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage("File size exceeds 5MB limit");
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleUpload = () => {
    if (!file) return;

    // Simulate upload process
    setUploadStatus("uploading");
    setParseStatus("none");

    // Read the file content and parse it using GitLogService
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedLogs = gitLogService.parseGitLog(content);

        setGitLogs(parsedLogs);

        if (parsedLogs.length === 0) {
          setParseStatus("empty");
          setUploadStatus("");
          setFile(null);
        } else {
          setParseStatus("success");
          setUploadStatus("success");

          // Show charts after successful parsing
          setTimeout(() => {
            setShowCharts(true);
            setFile(null);
            setUploadStatus("");
          }, 1000);
        }

        // Log the parsed data to the console for debugging
        console.log("Parsed Git Logs:", parsedLogs);
      } catch (error) {
        console.error("Error parsing git log:", error);
        setErrorMessage(
          "Failed to parse git log file. Please ensure it's a valid git log format."
        );
        setParseStatus("error");
        setUploadStatus("");
      }
    };

    reader.onerror = () => {
      setErrorMessage("Failed to read file. Please try again.");
      setParseStatus("error");
      setUploadStatus("");
    };

    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderParseStatusMessage = () => {
    if (parseStatus === "empty") {
      return (
        <div className="parse-status-message empty">
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3>No commits found</h3>
          <p>
            The file was processed successfully, but no valid git commits were
            found. Please check that your file contains valid git log output.
          </p>
          <button
            className="try-again-btn"
            onClick={() => setParseStatus("none")}
          >
            Try another file
          </button>
        </div>
      );
    } else if (parseStatus === "error") {
      return (
        <div className="parse-status-message error">
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>Something went wrong</h3>
          <p>
            {errorMessage ||
              "We encountered an issue processing your file. Please try again with a valid git log file."}
          </p>
          <button
            className="try-again-btn"
            onClick={() => setParseStatus("none")}
          >
            Try again
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {(parseStatus === "none" || gitLogs.length > 0) && (
        <div className="file-upload-container">
          <h2>Upload your output.txt file</h2>

          <div
            className={`drop-zone ${isDragging ? "active" : ""} ${
              file ? "has-file" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt"
              className="file-input"
            />

            {!file ? (
              <div className="upload-prompt">
                <div className="upload-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="drop-text">
                  Drag & drop your file here or <span>browse</span>
                </p>
                <p className="file-hint">Supports .txt file</p>
              </div>
            ) : (
              <div className="file-info">
                <div className="file-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMessage && !parseStatus && (
            <div className="error-message">{errorMessage}</div>
          )}

          {file && !errorMessage && (
            <button
              className={`upload-button ${uploadStatus}`}
              onClick={handleUpload}
              disabled={
                uploadStatus === "uploading" || uploadStatus === "success"
              }
            >
              {uploadStatus === "uploading" ? (
                <div className="spinner"></div>
              ) : uploadStatus === "success" ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Show charts
                </>
              ) : (
                "Show charts"
              )}
            </button>
          )}

          {!showCharts && gitLogs.length > 0 && (
            <div className="parsed-stats">
              <p>{gitLogs.length} commits processed successfully</p>
            </div>
          )}
        </div>
      )}

      {renderParseStatusMessage()}

      {showCharts && gitLogs.length > 0 && (
        <>
          <GitCharts gitLogs={gitLogs} />
        </>
      )}
    </>
  );
};

export default FileUpload;
