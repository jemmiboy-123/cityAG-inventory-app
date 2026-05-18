import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DEFAULTS = {
    low_stock_threshold: 2,
    email_alerts: false,
};

const PreferencesContext = createContext({
    preferences: DEFAULTS,
    updatePreferences: async () => ({ error: null }),
    loading: true,
});

export const PreferencesProvider = ({ children }) => {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            if (!user) {
                if (!cancelled) {
                    setPreferences(DEFAULTS);
                    setLoading(false);
                }
                return;
            }
            const { data, error } = await supabase
                .from('profiles')
                .select('low_stock_threshold, email_alerts')
                .eq('id', user.id)
                .maybeSingle();
            if (cancelled) return;
            if (data) {
                setPreferences({ ...DEFAULTS, ...data });
            } else if (error && error.code !== 'PGRST116') {
                // PGRST116 = no rows; ignore. Other errors (e.g. table missing)
                // fall back silently to defaults so the app stays usable.
                console.warn('preferences load failed:', error.message);
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [user]);

    const updatePreferences = useCallback(async (patch) => {
        if (!user) return { error: new Error('Not signed in') };
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...patch }, { onConflict: 'id' })
            .select('low_stock_threshold, email_alerts')
            .single();
        if (!error && data) setPreferences({ ...DEFAULTS, ...data });
        return { error };
    }, [user]);

    return (
        <PreferencesContext.Provider value={{ preferences, updatePreferences, loading }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferencesContext);
