import { useState } from "react";
import "../styles/GitCommand.css";

const GitCommand: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText("git log > output.txt").then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="command-box">
            <div className="command-display">
                <code>git log &gt; output.txt</code>
            </div>
            <div className="copy-options">
                <button
                    className={`copy-btn ${copied ? "copied" : ""}`}
                    onClick={copyToClipboard}
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
        </div>
    );
};

export default GitCommand;
