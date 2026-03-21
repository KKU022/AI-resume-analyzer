import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

type PdfParseResult = { text?: string; pages?: Array<{ text?: string }> };

export async function parsePDF(buffer: Buffer): Promise<string> {
  console.log('Buffer size:', buffer.length);

  let text = '';

  // -------------------------
  // LAYER 1: pdf-parse
  // -------------------------
  try {
    const candidate = pdfParse?.default || pdfParse;

    if (typeof candidate === 'function') {
      const data = (await candidate(buffer)) as PdfParseResult;
      text = normalizeText(data?.text || '').trim();
    } else if (candidate && typeof candidate === 'object' && typeof candidate.PDFParse === 'function') {
      const parser = new candidate.PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = (await parser.getText()) as PdfParseResult;
        text = normalizeText(result?.text || (result?.pages || []).map((p) => p.text || '').join(' ')).trim();
      } finally {
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
      }
    }

    if (text && text.length > 100) {
      console.log('Parsed with pdf-parse');
      return text;
    }
  } catch (err) {
    console.error('pdf-parse failed:', err);
  }

  // -------------------------
  // LAYER 2: pdfjs-dist
  // -------------------------
  try {
    console.log('Falling back to pdfjs');

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map((item) => {
        const textItem = item as { str?: string };
        return textItem.str || '';
      });
      fullText += `${strings.join(' ')}\n`;
    }

    const normalized = normalizeText(fullText);
    if (normalized.length > 50) {
      console.log('Parsed with pdfjs');
      return normalized;
    }
  } catch (err) {
    console.error('pdfjs failed:', err);
  }

  // -------------------------
  // FINAL FAIL
  // -------------------------
  throw new Error('Unable to extract text from this PDF');
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