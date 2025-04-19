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
  qwfqwfq
  qwf
  qw
  fqw
  fq
  wf
          onClick={copyToClipboard}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};


qwfqwfqw
fqwf
qw
fq
<WebGLBufferqwf>qwf</WebGLBufferqwf>

export default GitCommand;
