'use client';

import { useEffect } from 'react';

interface TranslateElementConstructor {
    new (options: { pageLanguage: string; layout?: number }, elementId: string): object;
    InlineLayout: { SIMPLE: number };
}

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: {
            translate: {
                TranslateElement: TranslateElementConstructor;
            };
        };
    }
}

export default function GoogleTranslate() {
    useEffect(() => {
        // Avoid inserting the script more than once (e.g. on hot-reload)
        if (document.getElementById('google-translate-script')) return;

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                { pageLanguage: 'en', layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
                'google_translate_element'
            );
        };

        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);

        return () => {
            const existing = document.getElementById('google-translate-script');
            if (existing) existing.remove();
            delete (window as Partial<Window>).googleTranslateElementInit;
        };
    }, []);

    return <div id="google_translate_element" />;
}
