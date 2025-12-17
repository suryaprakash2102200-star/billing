import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only_change_in_prod';
const key = new TextEncoder().encode(JWT_SECRET);

export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(key);
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        console.error('JWT Verify Error:', error);
        return null;
    }
}

export async function getSessionUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return null;

        const payload = await verifyToken(token);
        if (!payload) return null;

        return {
            userId: payload.userId,
            email: payload.email,
            role: payload.role || 'staff' // Default to staff if role missing, though login sets it
        };
    } catch (error) {
        // console.error('Session Error:', error);
        return null;
    }
}
