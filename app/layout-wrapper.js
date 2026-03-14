'use client';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { useAgency } from './context/AgencyContext';
import { useEffect } from 'react';

export default function LayoutWrapper({ children }) {
    const { agent, loading } = useAgency();
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname?.startsWith('/login');

    useEffect(() => {
        if (!loading && !agent && !isLoginPage) {
            router.push('/login');
        }
    }, [agent, loading, isLoginPage, router]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#020617'
            }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (isLoginPage) {
        return <div style={{ minHeight: '100vh', background: '#f8f9fc' }}>{children}</div>;
    }

    if (!agent) {
        return null; // Don't flash dashboard content if not authorized
    }

    return (
        <div style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
            <Header />
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
                <Sidebar />
                <div style={{ marginLeft: 240, flex: 1, overflowY: 'auto', background: '#f0f2f5' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
