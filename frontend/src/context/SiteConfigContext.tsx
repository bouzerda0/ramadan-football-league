import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export type SiteConfig = {
    title: string;
    subtitle: string;
    heroSubtitle: string;
    heroTitle1: string;
    heroTitle2: string;
    heroTitle3: string;
    logoPath: string;
    autoUpdateMatches: boolean;
    featuredMatchId: string;
    matchStage: string;
};

type SiteConfigContextType = {
    config: SiteConfig;
    isLoading: boolean;
    refreshConfig: () => void;
    updateLocalConfig: (data: Partial<SiteConfig>) => void;
};

const defaultConfig: SiteConfig = {
    title: 'UMPO',
    subtitle: 'RFL 2026',
    heroSubtitle: 'UMPO •  High School Tournament 2026

',
    heroTitle1: 'RAMADAN',
    heroTitle2: 'FOOTBALL',
    heroTitle3: 'LEAGUE',
    logoPath: '',
    autoUpdateMatches: true,
    featuredMatchId: '',
    matchStage: 'League Match',
};

const SiteConfigContext = createContext<SiteConfigContextType>({
    config: defaultConfig,
    isLoading: true,
    refreshConfig: () => { },
    updateLocalConfig: () => { },
});

export const useSiteConfig = () => useContext(SiteConfigContext);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_URL}/api/config`);
            if (res.ok) {
                const json = await res.json();
                const data = json.data || json;
                setConfig({
                    title: data.title || defaultConfig.title,
                    subtitle: data.subtitle || defaultConfig.subtitle,
                    heroSubtitle: data.heroSubtitle || defaultConfig.heroSubtitle,
                    heroTitle1: data.heroTitle1 || defaultConfig.heroTitle1,
                    heroTitle2: data.heroTitle2 || defaultConfig.heroTitle2,
                    heroTitle3: data.heroTitle3 || defaultConfig.heroTitle3,
                    logoPath: data.logoPath || '',
                    autoUpdateMatches: data.autoUpdateMatches !== undefined ? data.autoUpdateMatches : defaultConfig.autoUpdateMatches,
                    featuredMatchId: data.featuredMatchId || defaultConfig.featuredMatchId,
                    matchStage: data.matchStage || defaultConfig.matchStage,
                });
            }
        } catch (err) {
            console.error("Failed to fetch site config", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const refreshConfig = () => {
        fetchConfig();
    };

    const updateLocalConfig = (data: Partial<SiteConfig>) => {
        setConfig(prev => ({ ...prev, ...data }));
    };

    return (
        <SiteConfigContext.Provider value={{ config, isLoading, refreshConfig, updateLocalConfig }}>
            {children}
        </SiteConfigContext.Provider>
    );
};
