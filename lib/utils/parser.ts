type PdfParseModule = {
  PDFParse: new (options: { data: Uint8Array | Buffer }) => {
    getText: (params?: { first?: number; last?: number }) => Promise<{ text: string }>;
    getScreenshot: (params?: {
      imageBuffer?: boolean;
      imageDataUrl?: boolean;
      first?: number;
      last?: number;
      scale?: number;
    }) => Promise<{ pages: Array<{ data?: Uint8Array }> }>;
    destroy: () => Promise<void>;
  };
};

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

async function runOCROnImage(imageBuffer: Buffer): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');

  try {
    const result = await worker.recognize(imageBuffer);
    return normalizeText(result.data.text || '');
  } finally {
    await worker.terminate();
  }
}

async function extractPdfTextWithFallback(buffer: Buffer): Promise<string> {
  const { PDFParse } = (await import('pdf-parse')) as unknown as PdfParseModule;
  const parser = new PDFParse({ data: buffer });

  try {
    const textResult = await parser.getText();
    const parsedText = normalizeText(textResult.text || '');

    if (parsedText.length >= 50) {
      return parsedText;
    }

    const screenshots = await parser.getScreenshot({
      first: 1,
      last: 3,
      imageBuffer: true,
      imageDataUrl: false,
      scale: 1.7,
    });

    const ocrChunks: string[] = [];

    for (const page of screenshots.pages) {
      if (!page.data || page.data.length === 0) {
        continue;
      }

      const ocrText = await runOCROnImage(Buffer.from(page.data));
      if (ocrText) {
        ocrChunks.push(ocrText);
      }
    }

    const merged = normalizeText([parsedText, ...ocrChunks].filter(Boolean).join('\n\n'));

    if (!merged) {
      throw new Error('Could not extract readable text from PDF.');
    }

    return merged;
  } finally {
    await parser.destroy();
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
      const mammoth = await import('mammoth');
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
