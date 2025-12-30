const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

function isDangerousProtocol(url: string): boolean {
    const lowerUrl = url.toLowerCase().trim();
    return DANGEROUS_PROTOCOLS.some(protocol => lowerUrl.startsWith(protocol));
}

export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
        .replace(/on\w+\s*=\s*[^"'\s>]*/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/g, '')
        .replace(/on\w+\s*=\s*[^"'\s>]*/g, '')
        .replace(/javascript:/gi, '')
        .replace(/<iframe/gi, '')
        .replace(/<embed/gi, '')
        .replace(/<object/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}

export function sanitizeUrl(url: string): string {
    if (typeof url !== 'string') return '';

    if (isDangerousProtocol(url)) return '';

    const sanitized = sanitizeString(url);
    if (isDangerousProtocol(sanitized)) return '';

    return sanitized;
}

export function sanitizeRedirectData(data: any): any {
    if (!data || typeof data !== 'object') return {};

    const sanitized: any = {};

    if (data.from) sanitized.from = sanitizeUrl(data.from);

    if (data.to) sanitized.to = sanitizeUrl(data.to);

    if (data.type && ['301', '302', '307', '308'].includes(String(data.type))) {
        sanitized.type = String(data.type);
    } else if (data.type) sanitized.type = '301';

    if (typeof data.hits === 'number') sanitized.hits = data.hits;

    return sanitized;
}

export function sanitizeResponse(data: any): any {
    if (!data) return data;

    if (Array.isArray(data)) return data.map(item => sanitizeResponse(item));

    if (typeof data === 'object') {
        const sanitized: any = {};

        for (const key in data) {
            const value = data[key];

            if (typeof value === 'string' && (key === 'from' || key === 'to')) {
                sanitized[key] = sanitizeUrl(value);
            } else if (typeof value === 'object') {
                sanitized[key] = sanitizeResponse(value);
            } else sanitized[key] = value;
        }

        return sanitized;
    }

    return data;
}

