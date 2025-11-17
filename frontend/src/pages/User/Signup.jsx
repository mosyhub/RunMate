import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white py-16 px-4 sm:px-8 shadow-2xl">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">Join RunMate</p>
          <h1 className="text-4xl sm:text-5xl font-black">
            Build your <span className="text-orange-400">running story</span>.
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Sign up to unlock curated gear, faster checkout, and the same bold experience you saw on the home page.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
                Free & Fast
              </span>
            </div>
            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@runmate.com"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-700">
                Log in
              </Link>
            </p>
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <p className="text-sm font-semibold text-orange-500 uppercase tracking-wide">Membership perks</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Designed with the same bold palette as our home page.
            </h2>
            <div className="mt-8 grid gap-6">
              {[
                {
                  title: 'Custom gear feeds',
                  description: 'Save your sizes and surfaces to get curated drops each visit.'
                },
                {
                  title: 'Training intelligence',
                  description: 'Unlock pacing tips and early access to performance footwear.'
                },
                {
                  title: 'Unified cart & support',
                  description: 'Seamless checkout, synced carts, and responsive support.'
                }
              ].map((perk) => (
                <div key={perk.title} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5">
                  <h3 className="text-lg font-semibold text-gray-900">{perk.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{perk.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-900 text-white p-6">
              <p className="text-sm font-semibold text-orange-300">Need help?</p>
              <p className="mt-1 text-sm text-gray-200">
                Our RunMate support team is always on the course with you.
              </p>
              <Link
                to="/login"
                className="inline-flex mt-4 items-center justify-center rounded-xl border border-orange-400 px-5 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-500 hover:text-white transition"
              >
                Talk to support
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Signup;

