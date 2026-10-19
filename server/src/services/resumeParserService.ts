// @ts-ignore
import pdfParse from 'pdf-parse';

export interface ResumeParseResult {
  filename: string;
  fileSizeBytes: number;
  extractedText: string;
  sanitizedSummary: string;
  detectedSkills: string[];
}

export class ResumeParserService {
  private static MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
  private static ALLOWED_MIME_TYPES = ['application/pdf'];

  /**
   * Safely validates and extracts text from an uploaded resume buffer.
   * Strips potential prompt injections and rejects malicious / oversized files.
   */
  public static async parseResumePdf(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<ResumeParseResult> {
    // 1. Validate file size
    if (buffer.length > this.MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds 5MB limit (provided: ${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);
    }

    // 2. Validate MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType) && !filename.toLowerCase().endsWith('.pdf')) {
      throw new Error(`Invalid file type. Only PDF resumes are accepted.`);
    }

    // 3. Extract text using pdf-parse safely
    let extractedText = '';
    try {
      const parseFunction: any = (pdfParse as any).default || pdfParse;
      const data = await parseFunction(buffer);
      extractedText = data.text || '';
    } catch (err: any) {
      throw new Error(`Failed to parse PDF document: ${err.message || 'Malformed PDF'}`);
    }

    if (!extractedText || extractedText.trim().length < 20) {
      throw new Error(`Uploaded PDF contains insufficient readable text. Please upload a standard text-based resume.`);
    }

    // 4. Sanitize text: neutralizes potential prompt injection instructions
    // Replaces dangerous instruction prefixes like "SYSTEM:", "Ignore all prior instructions", etc.
    const sanitized = extractedText
      .replace(/system\s*:/gi, 'User Note:')
      .replace(/ignore\s+all\s+(prior|previous)\s+instructions/gi, '[neutralized instruction]')
      .trim();

    // 5. Detect high-yield engineering skills
    const commonSkills = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Java',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'PostgreSQL', 'Redis', 'GraphQL',
      'System Design', 'Microservices', 'Distributed Systems', 'Tailwind CSS', 'Next.js'
    ];

    const detectedSkills = commonSkills.filter(skill =>
      new RegExp(`\\b${skill}\\b`, 'i').test(sanitized)
    );

    // Create a 2-paragraph summary
    const firstLines = sanitized.split('\n').filter(l => l.trim().length > 0).slice(0, 10).join(' ');
    const sanitizedSummary = firstLines.length > 300 ? firstLines.substring(0, 300) + '...' : firstLines;

    return {
      filename,
      fileSizeBytes: buffer.length,
      extractedText: sanitized,
      sanitizedSummary,
      detectedSkills
    };
  }
}
