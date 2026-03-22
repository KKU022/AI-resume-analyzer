type MammothModule = {
  extractRawText: (input: { buffer: Buffer }) => Promise<{ value?: string }>;
};

let cachedMammoth: MammothModule | null = null;
let cachedPdfParseCandidate: unknown | undefined;

type PdfParseResult = { text?: string; pages?: Array<{ text?: string }> };

const PDF_ARTIFACT_PATTERN =
  /\b(obj|endobj|stream|endstream|xref|trailer|flatedecode|catalog|mediabox|resources|startxref)\b/i;

function stripPdfArtifactLines(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const cleaned = lines.filter((line) => {
    if (line.length < 2) {
      return false;
    }

    if (PDF_ARTIFACT_PATTERN.test(line)) {
      return false;
    }

    const slashTokens = (line.match(/\/[A-Za-z][A-Za-z0-9]*/g) || []).length;
    if (slashTokens >= 3) {
      return false;
    }

    const symbolRatio = (line.match(/[^A-Za-z0-9\s]/g) || []).length / Math.max(1, line.length);
    if (line.length > 20 && symbolRatio > 0.35) {
      return false;
    }

    return true;
  });

  return normalizeText(cleaned.join('\n'));
}

function looksLikePdfObjectStreamNoise(text: string): boolean {
  const normalized = normalizeText(text);
  if (!normalized) {
    return true;
  }

  const words = normalized.toLowerCase().match(/[a-z]{2,}/g) || [];
  const artifactHits = normalized.toLowerCase().match(
    /\b(obj|endobj|stream|endstream|xref|trailer|flatedecode|mediabox|resources|startxref|catalog)\b/g
  ) || [];
  const slashTokenHits = normalized.match(/\/[A-Za-z][A-Za-z0-9]*/g) || [];

  const artifactRatio = artifactHits.length / Math.max(1, words.length);
  const slashRatio = slashTokenHits.length / Math.max(1, words.length);

  return artifactRatio > 0.02 || slashRatio > 0.08;
}

async function getMammoth(): Promise<MammothModule | null> {
  if (cachedMammoth) {
    return cachedMammoth;
  }

  try {
    const mod = (await import('mammoth')) as unknown as { default?: MammothModule };
    cachedMammoth = mod.default || (mod as unknown as MammothModule);
    return cachedMammoth;
  } catch (error) {
    console.error('[DOCX] Failed to load mammoth module:', error);
    return null;
  }
}

async function getPdfParseCandidate(): Promise<unknown> {
  if (cachedPdfParseCandidate !== undefined) {
    return cachedPdfParseCandidate;
  }

  try {
    const mod = (await import('pdf-parse')) as unknown as { default?: unknown };
    cachedPdfParseCandidate = mod.default || mod;
    return cachedPdfParseCandidate;
  } catch (error) {
    console.error('[PDF] Failed to load pdf-parse module:', error);
    cachedPdfParseCandidate = null;
    return null;
  }
}

function recoverTextFromBytes(buffer: Buffer): string {
  // Last-resort recovery for image/scanned/corrupted PDFs: pull printable strings from raw bytes.
  const latin = buffer.toString('latin1');
  const utf = buffer.toString('utf8');
  const combined = `${latin}\n${utf}`;

  const chunks = combined.match(/[A-Za-z0-9][A-Za-z0-9\s,.:;_@()\-/'"&]{3,}/g) || [];
  const deduped = Array.from(new Set(chunks.map((c) => c.trim())));
  const joined = deduped.join('\n');

  return normalizeText(joined);
}

export async function parsePDF(buffer: Buffer): Promise<string> {
  console.log('Buffer size:', buffer.length);

  let text = '';

  // -------------------------
  // LAYER 1: pdf-parse
  // -------------------------
  try {
    const candidate = await getPdfParseCandidate();

    if (typeof candidate === 'function') {
      const data = (await candidate(buffer)) as PdfParseResult;
      text = stripPdfArtifactLines(data?.text || '').trim();
    } else if (candidate && typeof candidate === 'object') {
      const pdfParseClass = (candidate as { PDFParse?: unknown }).PDFParse;
      if (typeof pdfParseClass !== 'function') {
        throw new Error('pdf-parse candidate has no callable PDFParse');
      }

      const parser = new (pdfParseClass as new (input: { data: Uint8Array }) => {
        getText: () => Promise<PdfParseResult>;
        destroy?: () => Promise<void> | void;
      })({ data: new Uint8Array(buffer) });
      try {
        const result = (await parser.getText()) as PdfParseResult;
        text = stripPdfArtifactLines(result?.text || (result?.pages || []).map((p) => p.text || '').join(' ')).trim();
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

    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
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

    const normalized = stripPdfArtifactLines(fullText);
    if (normalized.length > 50) {
      console.log('Parsed with pdfjs');
      return normalized;
    }
  } catch (err) {
    console.error('pdfjs failed:', err);
  }

  // -------------------------
  // LAYER 3: RAW BYTE RECOVERY
  // -------------------------
  const recovered = recoverTextFromBytes(buffer);
  if (recovered.length > 20 && !looksLikePdfObjectStreamNoise(recovered)) {
    console.log('Recovered text from raw PDF bytes');
    return recovered;
  }

  return 'Resume text extraction produced limited output from this PDF.';
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

export type ResumeTextQuality = {
  isUsable: boolean;
  reason: string;
  metrics: {
    chars: number;
    words: number;
    lines: number;
    alphaRatio: number;
    uniqueWordRatio: number;
  };
};

export function assessResumeTextQuality(text: string): ResumeTextQuality {
  const normalized = normalizeText(text);
  const words = normalized.toLowerCase().match(/[a-z]{2,}/g) || [];
  const uniqueWords = new Set(words);
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const alphaChars = (normalized.match(/[a-zA-Z]/g) || []).length;
  const alphaRatio = alphaChars / Math.max(1, normalized.length);
  const uniqueWordRatio = uniqueWords.size / Math.max(1, words.length);
  const hasResumeSignals =
    /(experience|education|skills|projects|summary|work|employment|achievements|certifications|internship)/i.test(
      normalized
    );

  const metrics = {
    chars: normalized.length,
    words: words.length,
    lines: lines.length,
    alphaRatio,
    uniqueWordRatio,
  };

  if (!normalized) {
    return { isUsable: false, reason: 'EMPTY_TEXT', metrics };
  }

  if (/resume text extraction produced limited output/i.test(normalized)) {
    return { isUsable: false, reason: 'PARSER_PLACEHOLDER_TEXT', metrics };
  }

  if (looksLikePdfObjectStreamNoise(normalized)) {
    return { isUsable: false, reason: 'PDF_OBJECT_STREAM_NOISE', metrics };
  }

  if (normalized.length < 250 || words.length < 45) {
    return { isUsable: false, reason: 'TOO_SHORT_FOR_RELIABLE_SCORING', metrics };
  }

  if (alphaRatio < 0.45) {
    return { isUsable: false, reason: 'LIKELY_BINARY_OR_GARBLED_TEXT', metrics };
  }

  if (words.length >= 80 && uniqueWordRatio < 0.18) {
    return { isUsable: false, reason: 'LOW_TEXT_DIVERSITY_OCR_NOISE', metrics };
  }

  if (!hasResumeSignals && words.length < 120) {
    return { isUsable: false, reason: 'MISSING_RESUME_STRUCTURE_SIGNALS', metrics };
  }

  return { isUsable: true, reason: 'OK', metrics };
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
    const mammoth = await getMammoth();
    if (!mammoth) {
      throw new Error('DOCX parser unavailable');
    }
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