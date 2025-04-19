import { useState } from "react";
import "../styles/GitCommand.css";

const GitCommand: React.FC = () => {
    const [copied, setCopied] = useState(false);

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
