import { useState } from "react";
import "../styles/GitCommand.css";

interface GitCommandProps {
  command?: string;
  description?: string;
  title?: string;
}

const GitCommand: React.FC<GitCommandProps> = ({
  command = "git log > output.txt",
  description = "Saves git commit history to a text file",
  title = "Generate Git Log",
}) => {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="git-command-container">
      <div className="git-command-header">
        <h2>{title}</h2>
        {description && (
          <p className="git-command-description">{description}</p>
        )}
      </div>

      <div
        className={`git-command-box ${hovered ? "hovered" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={copyToClipboard}
      >
        <code>{command}</code>
        <button
          className={`git-command-copy ${copied ? "copied" : ""}`}
          aria-label="Copy to clipboard"
        >
          {copied ? "✓" : "Copy"}
        </button>
      </div>

      {copied && (
        <div className="git-command-feedback">Command copied to clipboard!</div>
      )}
    </div>
  );
};

export default GitCommand;
