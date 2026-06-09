import React from 'react';
import { User, Mail, Phone, Camera, Lock, X } from 'lucide-react';
import adminImage from "../../assets/image/adminkickclick.jpg";
import { useTheme } from '../../context/ThemeContext';
import { Spinner } from '@/components/ui/spinner';
import { getApiErrorMessage } from '@/shared/api';
import { getStorageDownloadUrl, uploadFileToStorage } from '@/shared/storage/object-storage.service';
import { useAuthStore } from '../../features/auth';

const createAvatarKey = (userId, file) => {
  const safeName = (file.name || 'avatar')
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');

  return `admins/${userId}/avatar-${Date.now()}-${safeName}`;
};

const GeneralSettings = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [profileImage, setProfileImage] = React.useState(adminImage);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState(null);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileError, setProfileError] = React.useState(null);
  const [profileSuccess, setProfileSuccess] = React.useState(null);
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(null);
  const [passwordSuccess, setPasswordSuccess] = React.useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formValues, setFormValues] = React.useState({
    name: '',
    email: '',
    contact: '',
  });
  const fileInputRef = React.useRef(null);
  const authUser = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);

  const resetProfileForm = React.useCallback(() => {
    setFormValues({
      name: authUser?.name || '',
      email: authUser?.email || '',
      contact: authUser?.contact || '',
    });
  }, [authUser]);

  React.useEffect(() => {
    resetProfileForm();
  }, [resetProfileForm]);

  React.useEffect(() => {
    let isCurrent = true;

    if (avatarPreviewUrl) {
      setProfileImage(avatarPreviewUrl);
      return () => {
        isCurrent = false;
      };
    }

    if (!authUser?.avatarKey) {
      setProfileImage(adminImage);
      return () => {
        isCurrent = false;
      };
    }

    getStorageDownloadUrl(authUser.avatarKey)
      .then((url) => {
        if (isCurrent) {
          setProfileImage(url);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setProfileImage(adminImage);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [authUser?.avatarKey, avatarPreviewUrl]);

  React.useEffect(() => () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
  }, [avatarPreviewUrl]);

  const passwordChangedText = React.useMemo(() => {
    if (!authUser?.passwordChangedAt) {
      return 'Password has not been changed yet';
    }

    const changedAt = new Date(authUser.passwordChangedAt);

    if (Number.isNaN(changedAt.getTime())) {
      return 'Password has not been changed yet';
    }

    return `Last changed ${new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(changedAt)}`;
  }, [authUser?.passwordChangedAt]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      const imageUrl = URL.createObjectURL(file);
      setAvatarFile(file);
      setAvatarPreviewUrl(imageUrl);
      setProfileImage(imageUrl);
    }

    event.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleProfileFieldChange = (field) => (event) => {
    setFormValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleProfileCancel = () => {
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarFile(null);
    setAvatarPreviewUrl(null);
    resetProfileForm();
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handleProfileSave = async () => {
    if (!authUser) {
      return;
    }

    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      let avatarKey = authUser.avatarKey || null;

      if (avatarFile) {
        avatarKey = await uploadFileToStorage(avatarFile, createAvatarKey(authUser.id, avatarFile));
      }

      await updateProfile({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        contact: formValues.contact.trim() || null,
        avatarKey,
      });

      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      setAvatarFile(null);
      setAvatarPreviewUrl(null);
      setProfileSuccess('Profile updated successfully.');
    } catch (error) {
      setProfileError(getApiErrorMessage(error, 'Unable to update profile. Please try again.'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordFieldChange = (field) => (event) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordError(null);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      closePasswordModal();
      setPasswordSuccess('Password updated successfully.');
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, 'Unable to update password. Please try again.'));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-500">
      <div className="mb-6 px-1">
        <h2 className="text-[26px] font-bold text-[#1A1A4B] dark:text-white">General Settings</h2>
        <p className="text-[14px] text-[#64748B] font-medium mt-1">Manage your profile</p>
      </div>

      {/* Profile Information Section */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] p-8 shadow-sm border border-[#F1F5F9] dark:border-gray-800">
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-[#1A1A4B] dark:text-white mb-1">Profile Information</h3>
          <p className="text-[13px] text-[#64748B] font-medium">Update your photo and personal details.</p>
        </div>

        <div className="flex gap-10 items-start pb-8 border-b border-[#F1F5F9] dark:border-gray-800">
          {/* Avatar Section */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#2D2D3F] shadow-sm">
              <img src={profileImage} alt="Admin profile" className="w-full h-full object-cover" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden" 
              accept="image/*"
            />
            <button 
              onClick={triggerFileInput}
              className="absolute bottom-1 right-1 p-2 bg-white dark:bg-[#2D2D3F] text-[#64748B] rounded-full shadow-md border border-[#F1F5F9] dark:border-gray-700 hover:scale-110 transition-all"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider px-1">NAME</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={formValues.name}
                    onChange={handleProfileFieldChange('name')}
                    disabled={profileSaving}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2D2D3F] border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-[15px] font-medium text-[#1E293B] dark:text-white outline-none focus:border-[#433E6F] transition-colors" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider px-1">EMAIL</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    value={formValues.email}
                    onChange={handleProfileFieldChange('email')}
                    disabled={profileSaving}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2D2D3F] border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-[15px] font-medium text-[#1E293B] dark:text-white outline-none focus:border-[#433E6F] transition-colors" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider px-1">CONTACT</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <Phone size={18} />
                </div>
                <input 
                  type="text" 
                  value={formValues.contact}
                  onChange={handleProfileFieldChange('contact')}
                  disabled={profileSaving}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#2D2D3F] border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-[15px] font-medium text-[#1E293B] dark:text-white outline-none focus:border-[#433E6F] transition-colors" 
                />
              </div>
            </div>
          </div>
        </div>

        {(profileError || profileSuccess) && (
          <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-bold ${profileError ? 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-300' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-300'}`}>
            {profileError || profileSuccess}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={handleProfileCancel}
            disabled={profileSaving}
            className="px-7 py-2.5 border border-[#E2E8F0] dark:border-gray-700 text-[#64748B] dark:text-gray-400 text-[14px] font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProfileSave}
            disabled={profileSaving || !formValues.name.trim() || !formValues.email.trim()}
            className="inline-flex min-w-[84px] items-center justify-center gap-2 px-7 py-2.5 bg-[#433E6F] text-white text-[14px] font-bold rounded-xl hover:bg-[#343058] transition-all shadow-md disabled:opacity-50"
          >
            {profileSaving ? (
              <>
                <Spinner className="size-4 text-white" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>

      {/* Password Settings Section */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] p-8 shadow-sm border border-[#F1F5F9] dark:border-gray-800">
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-[#1A1A4B] dark:text-white mb-1">Password settings</h3>
          <p className="text-[13px] text-[#64748B] font-medium">Keep your account secure with a strong password</p>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-[#F1F5F9] dark:border-gray-800">
          <div>
            <p className="text-[15px] font-bold text-[#1A1A4B] dark:text-white">Password</p>
            <p className="text-[12px] text-[#94A3B8] font-medium mt-0.5">{passwordChangedText}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setPasswordSuccess(null);
              setIsPasswordModalOpen(true);
            }}
            className="px-5 py-2.5 bg-white dark:bg-[#2D2D3F] border border-[#E2E8F0] dark:border-gray-700 rounded-xl text-[13px] font-bold text-[#64748B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3D3D4F] transition-all"
          >
            Update Password
          </button>
        </div>
        {passwordSuccess && (
          <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-300">
            {passwordSuccess}
          </div>
        )}
      </div>

      {/* Miscellanies Settings Section */}
      <div className="bg-white dark:bg-[#1E1E2D] rounded-[24px] p-8 shadow-sm border border-[#F1F5F9] dark:border-gray-800">
        <div className="mb-8">
          <h3 className="text-[18px] font-bold text-[#1A1A4B] dark:text-white mb-1">Miscellanies settings</h3>
          <p className="text-[13px] text-[#64748B] font-medium">Personalized your dashboard</p>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-[#F1F5F9] dark:border-gray-800">
          <p className="text-[15px] font-bold text-[#1A1A4B] dark:text-white">Dark Mode</p>
          <button 
            onClick={toggleDarkMode}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-[#433E6F]' : 'bg-[#CBD5E1]'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
          </button>
        </div>
      </div>
    </div>
    {isPasswordModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <form
          onSubmit={handlePasswordSubmit}
          className="w-full max-w-md rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#1E1E2D]"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-[18px] font-bold text-[#1A1A4B] dark:text-white">Update Password</h3>
              <p className="mt-1 text-[13px] font-medium text-[#64748B]">Enter your current password and choose a new one.</p>
            </div>
            <button
              type="button"
              onClick={closePasswordModal}
              className="rounded-xl p-2 text-[#94A3B8] transition-all hover:bg-gray-50 dark:hover:bg-[#2D2D3F]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="px-1 text-[12px] font-bold uppercase tracking-wider text-[#64748B]">Current Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFieldChange('currentPassword')}
                  disabled={passwordSaving}
                  required
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-12 pr-4 text-[15px] font-medium text-[#1E293B] outline-none transition-colors focus:border-[#433E6F] dark:border-gray-700 dark:bg-[#2D2D3F] dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="px-1 text-[12px] font-bold uppercase tracking-wider text-[#64748B]">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFieldChange('newPassword')}
                  disabled={passwordSaving}
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-12 pr-4 text-[15px] font-medium text-[#1E293B] outline-none transition-colors focus:border-[#433E6F] dark:border-gray-700 dark:bg-[#2D2D3F] dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="px-1 text-[12px] font-bold uppercase tracking-wider text-[#64748B]">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFieldChange('confirmPassword')}
                  disabled={passwordSaving}
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-12 pr-4 text-[15px] font-medium text-[#1E293B] outline-none transition-colors focus:border-[#433E6F] dark:border-gray-700 dark:bg-[#2D2D3F] dark:text-white"
                />
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:bg-red-900/10 dark:text-red-300">
              {passwordError}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closePasswordModal}
              disabled={passwordSaving}
              className="px-6 py-2.5 border border-[#E2E8F0] dark:border-gray-700 text-[#64748B] dark:text-gray-400 text-[14px] font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#433E6F] px-6 py-2.5 text-[14px] font-bold text-white shadow-md transition-all hover:bg-[#343058] disabled:opacity-50"
            >
              {passwordSaving ? (
                <>
                  <Spinner className="size-4 text-white" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    )}
    </>
  );
};

export default GeneralSettings;
