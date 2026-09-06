import { useEffect } from 'react';

const setMeta = (attr, key, value) => {
    if (!value) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', value);
};

const setCanonical = (href) => {
    if (!href) return;
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
};

export function usePageMeta({ title, description, canonical, robots = 'index, follow' }) {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = title;
        setMeta('name', 'description', description);
        setMeta('name', 'robots', robots);
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:url', canonical);
        setMeta('name', 'twitter:title', title);
        setMeta('name', 'twitter:description', description);
        setCanonical(canonical);

        return () => {
            document.title = previousTitle;
        };
    }, [title, description, canonical, robots]);
}
