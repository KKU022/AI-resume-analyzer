import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown parsing error';
}

export function normalizeText(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\r/g, '\n')
    .replace(/[\u00A0\t]+/g, ' ')
    .replace(/[\uFFFD]+/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdfTextWithFallback(buffer: Buffer): Promise<string> {
  try {
    console.log('[PDF] Parsing PDF buffer...');
    const data = await pdfParse(buffer);
    const parsedText = normalizeText(data.text || '');

    console.log(`[PDF] Extracted text length: ${parsedText.length} chars`);

    if (!parsedText) {
      throw new Error('Could not extract readable text from PDF.');
    }

    return parsedText;
  } catch (error) {
    console.error('[PDF] Extraction failed:', error instanceof Error ? error.message : String(error));
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractText(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  try {
    if (ext === 'pdf' || fileType === 'application/pdf') {
      return await extractPdfTextWithFallback(buffer);
    }

    if (
      ext === 'docx' ||
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      const docText = normalizeText(result.value || '');

      if (!docText) {
        throw new Error('DOCX file did not contain readable text.');
      }

      return docText;
    }

    if (
      ext === 'txt' ||
      ext === 'md' ||
      fileType === 'text/plain' ||
      fileType === 'text/markdown'
    ) {
      const text = normalizeText(buffer.toString('utf-8'));
      if (!text) {
        throw new Error('Text file is empty.');
      }
      return text;
    }

    throw new Error(`Unsupported file type: ${ext || 'unknown'}`);
  } catch (error: unknown) {
    console.error(`Extraction error for ${fileName}:`, error);

    if (ext === 'pdf' || fileType === 'application/pdf') {
      throw new Error(`Failed to extract PDF content: ${getErrorMessage(error)}`);
    }

    throw new Error(`Failed to extract text: ${getErrorMessage(error)}`);
  }
}
