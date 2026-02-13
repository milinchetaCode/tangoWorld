export function getApiUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // path should start with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // If it's a hostname without protocol (like from Render's internal networking), prepend http://
    // Note: On Render server-side, internal networking uses http://hostname
    // For client-side, we really need a full https://public-url
    const finalBaseUrl = baseUrl.includes('://') ? baseUrl : `http://${baseUrl}`;

    return `${finalBaseUrl}${normalizedPath}`;
}
