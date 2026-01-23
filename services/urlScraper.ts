// Helper function to convert a string to a Uint8Array, used by the allorigins.win proxy which returns binary data as a string.
function stringToUint8Array(str: string): Uint8Array {
    const len = str.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}

export async function extractTextFromPdf(pdfData: Uint8Array): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    const pdf = await loadingTask.promise;
    let text = '';
    const numPages = pdf.numPages;
    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => ('str' in item ? item.str : '')).join(' ');
        text += pageText + '\n\n';
    }
    return text.trim();
}

function extractTextFromHtml(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, nav, header, footer, aside, .noprint, [aria-hidden="true"]').forEach(el => el.remove());
    return doc.body.textContent?.trim() || '';
}

// --- Resilient Fetching Logic ---

interface ProxyHandler {
    buildUrl: (targetUrl: string) => string;
    processResponse: (response: Response, targetUrl: string) => Promise<{ content: string | Uint8Array, contentType: string }>;
}

const corsProxyIoHandler: ProxyHandler = {
    buildUrl: (targetUrl) => `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    processResponse: async (response, targetUrl) => {
        const contentType = response.headers.get('content-type') || '';
        let content: string | Uint8Array;

        if (contentType.includes('application/pdf') || (!contentType && targetUrl.toLowerCase().endsWith('.pdf'))) {
            const blob = await response.blob();
            content = new Uint8Array(await blob.arrayBuffer());
        } else {
            content = await response.text();
        }
        return { content, contentType };
    }
};

const allOriginsHandler: ProxyHandler = {
    buildUrl: (targetUrl) => `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
    processResponse: async (response) => {
        if (response.status === 429) {
             throw new Error("Proxy 'allorigins.win' is rate-limiting requests.");
        }
        const data = await response.json();
        if (!data.contents) {
            throw new Error("Proxy 'allorigins.win' did not return any content.");
        }
        if (data.status.http_code === 0 || data.status.http_code >= 400) {
            throw new Error(`The target URL returned an error code: ${data.status.http_code}. Please check the URL.`);
        }
        return {
            content: data.contents, // This proxy returns binary data as a string
            contentType: data.status.content_type || ''
        };
    }
};

// List of proxies to try in order. corsproxy.io is first as it handles binary data more robustly.
const PROXIES: ProxyHandler[] = [corsProxyIoHandler, allOriginsHandler];

async function processContent(content: string | Uint8Array, contentType: string, url: string): Promise<string> {
    const isPdf = contentType.includes('application/pdf') || url.toLowerCase().endsWith('.pdf');

    if (isPdf) {
        try {
            const pdfData = typeof content === 'string' ? stringToUint8Array(content) : content;
            if (pdfData.length === 0) throw new Error("Extracted PDF data is empty.");
            return await extractTextFromPdf(pdfData);
        } catch (pdfError) {
            console.error("PDF parsing failed:", pdfError);
            throw new Error("Failed to parse the PDF content from the URL. The file might be corrupted or in an unsupported format.");
        }
    }
    
    if (typeof content !== 'string') {
        throw new Error("Received unexpected binary content for a non-PDF URL.");
    }
    
    const extractedText = extractTextFromHtml(content);
    if (extractedText) {
        return extractedText;
    }
    
    // If HTML parsing yields nothing, return the raw content (for plain text files)
    return content;
}

export async function getTextFromUrl(url: string): Promise<string> {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    let lastError: Error | null = new Error("No proxies available to try.");

    for (const proxy of PROXIES) {
        try {
            const proxyUrl = proxy.buildUrl(url);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Proxy service returned status ${response.status}`);
            }
            
            const { content, contentType } = await proxy.processResponse(response, url);
            return await processContent(content, contentType, url);

        } catch (error) {
            console.warn(`A proxy failed:`, error);
            lastError = error instanceof Error ? error : new Error(String(error));
        }
    }

    throw new Error(`All proxies failed to fetch the URL. Last error: ${lastError.message}`);
}