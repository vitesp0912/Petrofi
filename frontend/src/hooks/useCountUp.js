import { useEffect, useState } from 'react';

export function useCountUp(target, { duration = 1400, enabled = true } = {}) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!enabled) return undefined;
        setValue(0);
        const start = performance.now();
        let frame = 0;
        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - (1 - p) ** 3;
            setValue(Math.round(target * eased));
            if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [enabled, target, duration]);

    return value;
}
