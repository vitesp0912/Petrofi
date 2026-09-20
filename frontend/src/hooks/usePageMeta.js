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
    let el = document.querySelector('link[rel="canonical"]');
    if (!href) {
        if (el) el.remove();
        return;
    }
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
        const indexable = !/noindex/i.test(robots || '');
        document.title = title;
        if (description) setMeta('name', 'description', description);
        setMeta('name', 'robots', robots);
        setMeta('name', 'googlebot', robots);
        setMeta('property', 'og:title', title);
        if (description) setMeta('property', 'og:description', description);
        setMeta('name', 'twitter:title', title);
        if (description) setMeta('name', 'twitter:description', description);
        if (indexable && canonical) {
            setMeta('property', 'og:url', canonical);
            setCanonical(canonical);
        } else {
            setCanonical(null);
        }

        return () => {
            document.title = previousTitle;
        };
    }, [title, description, canonical, robots]);
}
