import mammoth from 'mammoth';

// pdf-parse v2.x exports as default, handle both CommonJS patterns
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

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

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    console.log('[PDF] Starting PDF extraction...');
    
    if (typeof pdfParse !== 'function') {
      throw new Error(`pdf-parse export is not a function, got: ${typeof pdfParse}`);
    }
    
    const data = await pdfParse(buffer);
    const text = normalizeText(data.text || '');

    if (!text) {
      throw new Error('No text extracted from PDF');
    }

    console.log(`[PDF] Extraction successful: ${text.length} characters`);
    return text;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[PDF] Extraction error:', msg);
    throw new Error(`PDF extraction failed: ${msg}`);
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    console.log('[DOCX] Starting DOCX extraction...');
    const result = await mammoth.extractRawText({ buffer });
    const text = normalizeText(result.value || '');

    if (!text) {
      throw new Error('No text extracted from DOCX');
    }

    console.log(`[DOCX] Extraction successful: ${text.length} characters`);
    return text;
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function extractPlainText(buffer: Buffer): Promise<string> {
  try {
    const text = normalizeText(buffer.toString('utf-8'));

    if (!text) {
      throw new Error('File is empty');
    }

    console.log(`[TEXT] Extraction successful: ${text.length} characters`);
    return text;
  } catch (error) {
    throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function extractText(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<string> {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  console.log(`[EXTRACT] Processing file: ${fileName} (type: ${fileType}, ext: ${ext})`);

  try {
    if (ext === 'pdf' || fileType === 'application/pdf') {
      return await extractPdfText(buffer);
    }

    if (
      ext === 'docx' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return await extractDocxText(buffer);
    }

    if (
      ext === 'txt' ||
      ext === 'md' ||
      fileType === 'text/plain' ||
      fileType === 'text/markdown'
    ) {
      return await extractPlainText(buffer);
    }

    throw new Error(`Unsupported file type: ${ext}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[EXTRACT] Error processing ${fileName}: ${msg}`);
    throw error;
  }
}