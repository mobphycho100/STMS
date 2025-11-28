import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((s) => s.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const message = useMemo(() => {
        if (location.state?.message) return location.state.message;
        const p = new URLSearchParams(location.search);
        return p.get('m') || '';
    }, [location]);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(email, password);
            navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Login">
            <form onSubmit={onSubmit} className="space-y-3">
                {(message || error) && (
                    <div className="text-sm">
                        {message && <div className="text-blue-700 mb-1">{message}</div>}
                        {error && <div className="text-red-600">{error}</div>}
                    </div>
                )}
                <div>
                    <label className="block text-sm mb-1">Email</label>
                    <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button disabled={loading} className="w-full btn-primary">
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className="text-sm text-gray-600 mt-3">
                No account? <Link to="/signup" className="text-blue-600">Sign up</Link>
            </div>
        </AuthLayout>
    );
}
