import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
    session: null,
    user: null,
    loading: true,
    signOut: async () => {},
});

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return undefined;
        }

        let cancelled = false;
        const applySession = (nextSession) => {
            if (cancelled) return;
            setSession(nextSession ?? null);
            setLoading(false);
        };

        supabase.auth.getSession().then(({ data }) => {
            applySession(data.session ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            applySession(nextSession);
        });

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, []);

    const value = useMemo(() => ({
        session,
        user: session?.user ?? null,
        loading,
        signOut: async () => {
            if (supabase) await supabase.auth.signOut();
        },
    }), [session, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
