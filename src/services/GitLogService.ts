// Define the GitLog interface
export interface GitLog {
  commitHash: string;
  author: string;
  email: string;
  date: number; // Unix timestamp
  message: string;
}

class GitLogService {
  private static instance: GitLogService;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): GitLogService {
    if (!GitLogService.instance) {
      GitLogService.instance = new GitLogService();
    }
    return GitLogService.instance;
  }

  /**
   * Parse git log content into an array of GitLog objects
   * @param content - The content of the git log file
   * @returns Array of parsed GitLog objects
   */
  public parseGitLog(content: string): GitLog[] {
    const logs: GitLog[] = [];

    // Split by commit to get individual commit blocks
    const commitBlocks = content.split(/(?=commit [0-9a-f]{40})/);

    // Process each commit block
    for (const block of commitBlocks) {
      if (!block.trim()) continue;

      const commitMatch = block.match(/commit ([0-9a-f]{40})/);
      const authorMatch = block.match(/Author: (.*?) <(.*?)>/);
      const dateMatch = block.match(/Date:\s+(.+)/);

      // Extract message - it's the content after the date line, typically indented
      const lines = block.split("\n");
      let messageStart = false;
      let message = "";

      for (const line of lines) {
        if (messageStart) {
          // Add each line of the message, trimming the leading spaces
          message += (message ? "\n" : "") + line.trim();
        } else if (line.startsWith("Date:")) {
          // The message starts after the Date line
          messageStart = true;
        }
      }

      if (commitMatch && authorMatch && dateMatch) {
        const commitHash = commitMatch[1];
        const author = authorMatch[1];
        const email = authorMatch[2];
        const dateStr = dateMatch[1];

        // Convert date string to timestamp
        const timestamp = new Date(dateStr).getTime();

        // Create GitLog object
        logs.push({
          commitHash,
          author,
          email,
          date: timestamp,
          message: message.trim(),
        });
      }
    }

    return logs;
  }
}

export default GitLogService;
