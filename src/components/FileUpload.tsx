import { useState, useRef } from "react";
import "../styles/FileUpload.css";
import GitLogService, { GitLog } from "../services/GitLogService";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [gitLogs, setGitLogs] = useState<GitLog[]>([]);
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

    // Read the file content and parse it using GitLogService
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedLogs = gitLogService.parseGitLog(content);

        setGitLogs(parsedLogs);
        setUploadStatus("success");

        // Log the parsed data to the console for debugging
        console.log("Parsed Git Logs:", parsedLogs);

        // Reset file state after 3 seconds while keeping the parsed data
        setTimeout(() => {
          setFile(null);
          setUploadStatus("");
        }, 3000);
      } catch (error) {
        console.error("Error parsing git log:", error);
        setErrorMessage(
          "Failed to parse git log file. Please ensure it's a valid git log format."
        );
        setUploadStatus("");
      }
    };

    reader.onerror = () => {
      setErrorMessage("Failed to read file. Please try again.");
      setUploadStatus("");
    };

    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
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
              <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        )}
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {file && !errorMessage && (
        <button
          className={`upload-button ${uploadStatus}`}
          onClick={handleUpload}
          disabled={uploadStatus === "uploading" || uploadStatus === "success"}
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
              Uploaded
            </>
          ) : (
            "Upload"
          )}
        </button>
      )}

      {gitLogs.length > 0 && (
        <div className="parsed-stats">
          <p>{gitLogs.length} commits processed successfully</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
