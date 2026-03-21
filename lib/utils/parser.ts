import mammoth from 'mammoth';

type PdfParseFn = (buffer: Buffer) => Promise<{ text?: string }>;
type PdfParseClass = new (params: { data: Uint8Array }) => {
  getText: () => Promise<{ text?: string; pages?: Array<{ text?: string }> }>;
  destroy?: () => Promise<void> | void;
};

export const PDF_FALLBACK_TEXT =
  'Resume uploaded successfully, but text extraction was limited. Please use a standard text-based PDF.';

let cachedPdfModule: unknown = null;

async function getPdfModule(): Promise<unknown> {
  if (cachedPdfModule) {
    return cachedPdfModule;
  }

  try {
    const mod = await import('pdf-parse');
    cachedPdfModule = mod;
    return mod;
  } catch (error) {
    console.error('[PDF] Failed to load pdf-parse module:', error);
    return null;
  }
}

function normalizePdfResult(input: unknown): string {
  if (!input || typeof input !== 'object') {
    return '';
  }

  const maybe = input as { text?: string; pages?: Array<{ text?: string }> };
  const byText = normalizeText(maybe.text || '');
  if (byText) {
    return byText;
  }

  const byPages = normalizeText((maybe.pages || []).map((p) => p.text || '').join('\n'));
  return byPages;
}

async function tryParseWithCandidate(candidate: unknown, buffer: Buffer): Promise<string> {
  if (typeof candidate === 'function') {
    const result = await (candidate as PdfParseFn)(buffer);
    return normalizePdfResult(result);
  }

  if (candidate && typeof candidate === 'object' && 'PDFParse' in candidate) {
    const PDFParseCtor = (candidate as { PDFParse?: unknown }).PDFParse;
    if (typeof PDFParseCtor === 'function') {
      const parser = new (PDFParseCtor as PdfParseClass)({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        return normalizePdfResult(result);
      } finally {
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
      }
    }
  }

  return '';
}

export async function parsePDF(buffer: Buffer): Promise<string> {
  console.log('Buffer size:', buffer.length);

  try {
    const mod = await getPdfModule();
    if (!mod) {
      return PDF_FALLBACK_TEXT;
    }

    const moduleObj = mod as { default?: unknown };
    const candidates = [moduleObj.default, mod];

    for (const candidate of candidates) {
      const text = await tryParseWithCandidate(candidate, buffer);
      if (text && text.length >= 50) {
        return text;
      }
    }

    throw new Error('Weak PDF content');
  } catch (error) {
    console.error('PDF parsing failed:', error);
    return PDF_FALLBACK_TEXT;
  }
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

async function extractPdfText(buffer: Buffer): Promise<string> {
  console.log('[PDF] Starting PDF extraction...');
  const text = await parsePDF(buffer);
  console.log(`[PDF] Extraction completed: ${text.length} characters`);
  return text;
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