import { useEffect } from 'react';

export function useVisualKeyboard() {
    useEffect(() => {
        const root = document.documentElement;
        const viewport = window.visualViewport;
        if (!viewport) return undefined;

        const update = () => {
            const height = Math.round(viewport.height);
            const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
            root.style.setProperty('--vv-height', `${height}px`);
            root.style.setProperty('--kk-inset', `${Math.round(inset)}px`);
        };

        update();
        viewport.addEventListener('resize', update);
        viewport.addEventListener('scroll', update);
        return () => {
            viewport.removeEventListener('resize', update);
            viewport.removeEventListener('scroll', update);
            root.style.removeProperty('--vv-height');
            root.style.removeProperty('--kk-inset');
        };
    }, []);
}
