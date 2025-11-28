import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import useAuthStore from '../../store/authStore';

export default function SignupPage() {
    const navigate = useNavigate();
    const signup = useAuthStore((s) => s.signup);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [secretKey, setSecretKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!name.trim() || !email.trim() || !password) throw new Error('All fields are required');
            if (password !== confirmPassword) throw new Error('Passwords must match');
            if (role === 'ADMIN' && !secretKey.trim()) throw new Error('Admin secret is required for admin signup');

            const payload = { name: name.trim(), email: email.trim(), password, confirmPassword, role };
            if (role === 'ADMIN') payload.secretKey = secretKey.trim();
            const user = await signup(payload);
            navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Sign up">
            <form onSubmit={onSubmit} className="space-y-3">
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <div>
                    <div>
                        <label className="block text-sm mb-1">Name</label>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                </div>
                <div>
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>
                <div>
                    <div>
                        <label className="block text-sm mb-1">Password</label>
                        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                </div>
                <div>
                    <div>
                        <label className="block text-sm mb-1">Confirm Password</label>
                        <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                </div>
                <div>
                    <div>
                        <label className="block text-sm mb-1">Role</label>
                        <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>
                {role === 'ADMIN' && (
                    <div>
                        <div>
                            <label className="block text-sm mb-1">Admin Secret Key</label>
                            <input className="input" type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} />
                        </div>
                    </div>
                )}
                <button disabled={loading} className="w-full btn-primary">
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
            </form>
            <div className="text-sm text-gray-600 mt-3">
                Have an account? <Link to="/login" className="text-blue-600">Login</Link>
            </div>
        </AuthLayout>
    );
}
