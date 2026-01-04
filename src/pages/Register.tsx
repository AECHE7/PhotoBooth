import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                navigate('/gallery');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to register');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
            <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Name (Optional)</label>
                        <input
                            type="text"
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-blue-500 outline-none"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-blue-500 outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-blue-500 outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold transition-colors">
                        Sign Up
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    <p className="text-gray-400">Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Login</Link></p>
                    <p className="mt-2"><Link to="/" className="text-gray-500 hover:text-gray-400">← Back Home</Link></p>
                </div>
            </div>
        </div>
    );
};
