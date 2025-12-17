import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import DashboardLayoutClient from '@/components/DashboardLayoutClient';

async function getUser() {
    return null;
}

export default async function DashboardLayout({ children }) {
    // MOCK USER for dev
    const user = {
        _id: 'mock_admin_id',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
    };

    // Pass user to client wrapper which handles Sidebar state
    return (
        <DashboardLayoutClient user={{ ...user, _id: user._id.toString() }}>
            {children}
        </DashboardLayoutClient>
    );
}
