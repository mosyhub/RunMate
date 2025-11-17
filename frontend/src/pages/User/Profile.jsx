import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schema
const profileSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .required('Display name is required')
});

function Profile() {
  const { currentUser, logout, updateUserProfile, uploadPhoto } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [photoURL, setPhotoURL] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formik = useFormik({
    initialValues: {
      displayName: ''
    },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setError('');
        setSuccess('');
        formik.setSubmitting(true);

        const updateData = {};
        const currentName = currentUser.displayName || currentUser.name || '';
        if (values.displayName !== currentName) {
          updateData.name = values.displayName;
        }

        if (Object.keys(updateData).length > 0) {
          await updateUserProfile(updateData);
          setSuccess('Profile updated successfully!');
        } else {
          setSuccess('No changes to update');
        }
      } catch (err) {
        setError(err.message || 'Failed to update profile');
      } finally {
        formik.setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    formik.setValues({
      displayName: currentUser.displayName || currentUser.name || ''
    });
    setPhotoURL(currentUser.photoURL || currentUser.photo || '');
  }, [currentUser, navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setUploading(true);

      const updatedUser = await uploadPhoto(file);
      setPhotoURL(updatedUser.photoURL || updatedUser.photo);
      setSuccess('Photo uploaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };


  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-gray-900 text-white py-16 px-4 sm:px-8 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">Runner Profile</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-2">
              Manage your <span className="text-orange-400">RunMate identity</span>.
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-2xl">
              Same bold palette as the home page—polished cards, confident typography, zero overlap.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl border border-orange-400 px-5 py-2.5 text-sm font-semibold text-orange-400 hover:bg-orange-500 hover:text-white transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,2fr]">
          <section className="rounded-3xl border border-gray-100 bg-white shadow-2xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="h-32 w-32 rounded-3xl object-cover shadow-lg ring-4 ring-indigo-100"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center text-4xl font-bold shadow-lg ring-4 ring-indigo-100">
                    {formik.values.displayName
                      ? formik.values.displayName.charAt(0).toUpperCase()
                      : currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="absolute -bottom-2 -right-2 inline-flex items-center justify-center rounded-full bg-white shadow-lg p-3 text-orange-500">
                  📷
                </span>
              </div>
              <p className="mt-4 text-xl font-semibold text-gray-900">
                {formik.values.displayName || currentUser?.email?.split('@')[0]}
              </p>
              <p className="text-sm text-gray-500">{currentUser?.email}</p>

              {error && (
                <div className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-6 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? 'Uploading photo...' : 'Update Photo'}
              </button>

              <div className="mt-8 w-full rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Membership tier</p>
                <p className="mt-1 text-lg font-bold text-gray-900">Community Runner</p>
                <p className="mt-2 text-sm text-gray-600">
                  Earn badges by reviewing products, logging orders, and sharing your runs.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            <p className="mt-2 text-sm text-gray-600">
              Keep your RunMate identity fresh and synced across the experience.
            </p>

            <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-600 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="displayName" className="block text-sm font-semibold text-gray-800">
                  Display name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formik.values.displayName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="What should we call you?"
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    formik.touched.displayName && formik.errors.displayName
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-gray-200'
                  }`}
                />
                {formik.touched.displayName && formik.errors.displayName && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.displayName}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {formik.isSubmitting ? 'Updating...' : 'Save changes'}
              </button>
            </form>

            <div className="mt-10 rounded-2xl border border-gray-900 bg-gray-900 p-6 text-white">
              <p className="text-sm font-semibold text-orange-300">Need to leave for now?</p>
              <p className="mt-1 text-sm text-gray-200">
                Logging out keeps your data safe. You can always jump back in when it's time to train.
              </p>
              <button
                onClick={handleLogout}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-orange-400 px-5 py-2.5 text-sm font-semibold text-orange-400 hover:bg-orange-500 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Profile;

