import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfileRole = async (userId) => {
        if (!userId) { setRole(null); return; }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();
            if (error) {
                console.warn('[Auth] role query error:', error.message);
                setRole('user');
                return;
            }
            setRole(data?.role ?? 'user');
        } catch (e) {
            console.warn('[Auth] role fetch threw:', e);
            setRole('user');
        }
    };

    useEffect(() => {
        let cancelled = false;

        // Use onAuthStateChange as the SOLE source of truth.
        // It fires INITIAL_SESSION immediately on subscribe with the current
        // session (or null), then SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED.
        // CRITICAL: never `await` another supabase call inside this callback —
        // supabase-js holds an internal lock while the callback runs, and any
        // awaited supabase query inside it will deadlock the whole client
        // (every subsequent query hangs forever). Defer follow-up work with
        // setTimeout so the lock is released first.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (cancelled) return;
            setUser(session?.user ?? null);
            setTimeout(() => {
                if (cancelled) return;
                loadProfileRole(session?.user?.id);
            }, 0);
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                if (!cancelled) setLoading(false);
            }
        });

        // Safety net: if for some reason INITIAL_SESSION never fires, don't
        // leave the app stuck on the loading screen forever.
        const safetyTimer = setTimeout(() => {
            if (!cancelled) setLoading(false);
        }, 3000);

        return () => {
            cancelled = true;
            clearTimeout(safetyTimer);
            subscription.unsubscribe();
        };
    }, []);

    const signIn = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    const signUp = (email, password, metadata) =>
        supabase.auth.signUp({ email, password, options: { data: metadata } });

    const signOut = () => supabase.auth.signOut();

    const isAdmin = role === 'admin';

    return (
        <AuthContext.Provider value={{ user, role, isAdmin, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
