import mammoth from 'mammoth';

type PdfParseFn = (buffer: Buffer) => Promise<{ text?: string }>;
type PdfParseV2Ctor = new (params: { data: Uint8Array }) => {
  getText: (params?: Record<string, unknown>) => Promise<{
    text?: string;
    pages?: Array<{ text?: string }>;
  }>;
  destroy?: () => Promise<void> | void;
};

let cachedPdfParse: PdfParseFn | null = null;

async function getPdfParse(): Promise<PdfParseFn> {
  if (cachedPdfParse) {
    return cachedPdfParse;
  }

  try {
    const mod = (await import('pdf-parse')) as unknown as {
      default?: unknown;
      PDFParse?: PdfParseV2Ctor;
    };

    const candidate = mod.default ?? mod;

    if (typeof candidate === 'function') {
      cachedPdfParse = candidate as PdfParseFn;
      return cachedPdfParse;
    }

    const PDFParseClass = mod.PDFParse;
    if (typeof PDFParseClass === 'function') {
      cachedPdfParse = async (buffer: Buffer) => {
        const parser = new PDFParseClass({ data: new Uint8Array(buffer) });
        try {
          const result = await parser.getText();
          const joinedPages = (result.pages || [])
            .map((page) => page.text || '')
            .join('\n');

          return { text: result.text || joinedPages };
        } finally {
          if (typeof parser.destroy === 'function') {
            await parser.destroy();
          }
        }
      };

      return cachedPdfParse;
    }

    throw new Error('Unsupported pdf-parse export format');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`pdf-parse failed to load: ${msg}`);
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
  try {
    console.log('[PDF] Starting PDF extraction...');

    const pdfParse = await getPdfParse();
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