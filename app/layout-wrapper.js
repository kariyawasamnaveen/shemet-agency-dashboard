'use client';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ShemetLoader from './components/ShemetLoader';
import { useAgency } from './context/AgencyContext';
import { useEffect } from 'react';

export default function LayoutWrapper({ children }) {
    const { agent, loading } = useAgency();
    const pathname = usePathname();
    const router = useRouter();
    const isAuthPage = pathname?.startsWith('/login') || pathname === '/register';

    useEffect(() => {
        const now = new Date().toLocaleTimeString();
        if (loading) {
            console.log(`[NAV_DEBUG] [${now}] Dashboard is LOADING...`);
            return;
        }

        const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com';
        const hasAdminPrivs = isSuperAdmin || agent?.isAdmin === true;
        const isAdminPath = pathname?.startsWith('/admin') || pathname?.startsWith('/economy') || pathname?.startsWith('/users');

        if (!agent && !isAuthPage) {
            console.warn(`[NAV_DEBUG] [${now}] REDIRECT TRIGGERED: agent is null. Path: ${pathname}`);
            router.push('/login');
        } else if (agent && isAdminPath && !hasAdminPrivs) {
            console.error(`[NAV_DEBUG] [${now}] SECURITY BREACH: Non-admin attempted to access ${pathname}. Redirecting...`);
            router.push('/');
        } else if (agent) {
            console.log(`[NAV_DEBUG] [${now}] AUTHENTICATED: agent uid = ${agent.uid}. Path: ${pathname}`);
        }
    }, [agent, loading, isAuthPage, router, pathname]);

    if (loading) {
        return <ShemetLoader />;
    }

    if (isAuthPage) {
        return <div style={{ minHeight: '100vh', background: '#f8fafc' }} className="animate-fade-in">{children}</div>;
    }

    if (!agent) {
        return null; // Don't flash dashboard content if not authorized
    }

    return (
        <div style={{ margin: 0, fontFamily: 'Outfit, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
            <Header />
            <div style={{ display: 'flex', paddingTop: '60px' }}>
                <Sidebar />
                <main style={{ 
                    marginLeft: '250px', 
                    width: 'calc(100% - 250px)', 
                    padding: '30px',
                    minHeight: 'calc(100vh - 60px)',
                    animation: 'fadeIn 0.6s ease-out'
                }} className="animate-fade-in no-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
