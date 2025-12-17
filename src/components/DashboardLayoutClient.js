'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayoutClient({ children, user }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse

    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            <Navbar user={user} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <Sidebar
                isOpen={isSidebarOpen}
                closeSidebar={() => setIsSidebarOpen(false)}
                user={user}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            <main className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} ml-0 mt-16 p-4 md:p-8 h-[calc(100vh-64px)] overflow-y-auto bg-white`}>
                {children}
            </main>
        </div>
    );
}
