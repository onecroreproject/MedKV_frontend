import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { getMe, updateProfileDetails, updatePassword, updatePreferences, updateTwoFactor } from '../../services/userService';

export function ProfileSettingsTab({ STUDENT_PROFILE, ENROLLED_COURSES, onNavigate }) {
  // 1. Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: STUDENT_PROFILE.name,
    email: STUDENT_PROFILE.email,
    mobile: STUDENT_PROFILE.mobile,
    gender: 'Male',
    dob: '1995-08-24',
    qualification: STUDENT_PROFILE.specialty,
    specialization: 'Diagnostic Neuroradiology',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    address: 'Flat 4B, 12 Park Road, Anna Nagar'
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [personalSavedAlert, setPersonalSavedAlert] = useState(false);

  // 2. Security Settings State
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securitySavedAlert, setSecuritySavedAlert] = useState(false);
  const [twoFactorActive, setTwoFactorActive] = useState(false);

  // Account Preferences State
  const [preferences, setPreferences] = useState({
    theme: 'light',
    emailNotifications: true,
    smsAlerts: false,
    liveClassReminder: true,
    dailyMcqReminder: true,
    language: 'English'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSessions, setActiveSessions] = useState([]);

  // Fetch true user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMe();
        if (response && response.data) {
          const user = response.data;
          setPersonalInfo({
            fullName: user.name || STUDENT_PROFILE.name,
            email: user.email || STUDENT_PROFILE.email,
            mobile: user.phoneNumber || STUDENT_PROFILE.mobile,
            gender: user.gender || 'Male',
            dob: user.dob ? user.dob.split('T')[0] : '1995-08-24',
            qualification: user.qualification || STUDENT_PROFILE.specialty,
            specialization: user.specialization || 'Diagnostic Neuroradiology',
            country: user.country || 'India',
            state: user.state || 'Tamil Nadu',
            city: user.city || 'Chennai',
            address: user.address || 'Flat 4B, 12 Park Road, Anna Nagar'
          });
          if (user.preferences) {
            setPreferences({
              ...preferences,
              ...user.preferences
            });
          }
          setTwoFactorActive(user.twoFactorEnabled || false);
          if (user.sessions) {
            setActiveSessions(user.sessions);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    fetchUserData();
  }, []);

  const handlePersonalInfoSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await updateProfileDetails({
        name: personalInfo.fullName,
        phoneNumber: personalInfo.mobile,
        gender: personalInfo.gender,
        dob: personalInfo.dob,
        qualification: personalInfo.qualification,
        specialization: personalInfo.specialization,
        address: personalInfo.address,
        city: personalInfo.city,
        state: personalInfo.state,
        country: personalInfo.country,
      });
      setPersonalSavedAlert(true);
      setIsEditingInfo(false);
      setTimeout(() => setPersonalSavedAlert(false), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await updatePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword
      });
      setSecuritySavedAlert(true);
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSecuritySavedAlert(false), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(newPreferences);
    try {
      await updatePreferences(newPreferences);
    } catch (err) {
      console.error("Failed to save preferences:", err);
      // Revert on failure
      setPreferences(preferences);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };
    setPreferences(newPreferences);
    try {
      await updatePreferences(newPreferences);
    } catch (err) {
      console.error("Failed to save preferences:", err);
      // Revert on failure
      setPreferences(preferences);
    }
  };

  const handleTwoFactorToggle = async () => {
    const newState = !twoFactorActive;
    setTwoFactorActive(newState);
    try {
      await updateTwoFactor(newState);
    } catch (err) {
      console.error("Failed to update two-factor setting:", err);
      // Revert if API fails
      setTwoFactorActive(!newState);
      setErrorMsg("Failed to update 2FA setting.");
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeDeviceSession(sessionId);
      setActiveSessions(prev => prev.filter(s => s._id !== sessionId));
    } catch (err) {
      console.error("Failed to revoke session:", err);
      setErrorMsg("Failed to revoke session.");
    }
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-8">
      
      {/* SECTION 3: Profile Hero Card */}
      <div className="bg-gradient-to-br from-[#0B1F4D] to-[#040817] border border-accent/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl text-left transition-all duration-300 hover:shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.04)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar block */}
            <div className="relative shrink-0">
              <span className="text-5xl bg-white/10 border-2 border-accent/40 rounded-full h-24 w-24 flex items-center justify-center shadow-lg">
                {STUDENT_PROFILE.avatar}
              </span>
              <span className="absolute bottom-1 right-1 h-4.5 w-4.5 bg-emerald-500 border-2 border-[#0B1F4D] rounded-full animate-pulse" />
            </div>
            
            <div className="space-y-3.5 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-white font-black text-2xl tracking-tight leading-none">{personalInfo.fullName}</h2>
                <span className="bg-accent/15 border border-accent/30 text-accent text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ID: sam-2026-8942
                </span>
              </div>
              
              <p className="text-slate-300 text-xs font-light max-w-md">
                {personalInfo.qualification} • {personalInfo.specialization}
              </p>

              {/* Badges deck */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  Active Student
                </span>
                <span className="bg-accent/15 border border-accent/35 text-accent text-[9px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  Member
                </span>
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  FRCR Aspirant
                </span>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-2 text-[11px] text-slate-300 font-medium">
                <div>📧 <span className="text-slate-400">Email:</span> {personalInfo.email}</div>
                <div>📞 <span className="text-slate-400">Phone:</span> {personalInfo.mobile}</div>
                <div>🌍 <span className="text-slate-400">Country:</span> {personalInfo.country}</div>
                <div>🗓️ <span className="text-slate-400">Member Since:</span> Jan 2026</div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2.5 justify-center sm:justify-start">
                <button
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className="bg-accent hover:bg-[#A8802E] active:scale-95 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all duration-300 shadow cursor-pointer"
                >
                  {isEditingInfo ? 'View Profile' : 'Edit Profile'}
                </button>
                <button
                  onClick={() => {
                    const secElem = document.getElementById('security-section');
                    if (secElem) secElem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-transparent hover:bg-white/10 text-slate-200 border border-slate-400/30 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Right Side chest MRI vector placeholder */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-dashed border-accent/20 flex items-center justify-center p-3 relative transform-gpu will-change-transform">
              <div className="w-full h-full rounded-full border border-accent/35 flex items-center justify-center p-4 bg-[#0A1224]/90 shadow-lg shadow-black/30">
                <svg className="w-16 h-16 text-accent transition-transform duration-300 hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v17.792m0-17.792a9.001 9.001 0 1 1-5.903 12.35m5.903-12.35a9.001 9.001 0 1 0 9.172 9.421" />
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-4 rounded-2xl font-bold text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <span>⚠️</span> <span>{errorMsg}</span>
        </div>
      )}

      {personalSavedAlert && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-2xl font-bold text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <span>✓</span> <span>Personal information saved successfully! All analytics and directories synced.</span>
        </div>
      )}

      {securitySavedAlert && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 p-4 rounded-2xl font-bold text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <span>✓</span> <span>Security credentials updated successfully! Device access calibration complete.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Personal Info, Security, timeline */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* SECTION 4: Personal Information Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden transform-gpu will-change-transform">
            <div className="flex justify-between items-center pb-4.5 border-b border-slate-100 mb-6">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>📋</span> <span>Personal Information</span>
              </h3>
              <button
                onClick={() => setIsEditingInfo(!isEditingInfo)}
                className="text-accent hover:underline text-xs font-bold focus:outline-none cursor-pointer"
              >
                {isEditingInfo ? 'Cancel' : 'Edit Info'}
              </button>
            </div>

            <form onSubmit={handlePersonalInfoSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {[
                  { key: 'fullName', label: 'Full Name', type: 'text' },
                  { key: 'email', label: 'Email Address', type: 'email' },
                  { key: 'mobile', label: 'Mobile Number', type: 'tel' },
                  { key: 'gender', label: 'Gender', type: 'text' },
                  { key: 'dob', label: 'Date of Birth', type: 'date' },
                  { key: 'qualification', label: 'Qualification specialty', type: 'text' },
                  { key: 'specialization', label: 'Specialization Interest', type: 'text' },
                  { key: 'country', label: 'Country', type: 'text' },
                  { key: 'state', label: 'State / Province', type: 'text' },
                  { key: 'city', label: 'City', type: 'text' }
                ].map((field) => (
                  <div key={field.key} className="relative">
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={personalInfo[field.key]}
                      disabled={!isEditingInfo}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-xs focus:outline-none focus:ring-4 focus:ring-accent/15 focus:border-accent transition-all duration-300 font-medium ${
                        isEditingInfo ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/50 text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                ))}
                
                {/* Full Width Address Field */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Address</label>
                  <input
                    type="text"
                    value={personalInfo.address}
                    disabled={!isEditingInfo}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-xs focus:outline-none focus:ring-4 focus:ring-accent/15 focus:border-accent transition-all duration-300 font-medium ${
                      isEditingInfo ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/50 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {isEditingInfo && (
                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingInfo(false)}
                    className="bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-lg transition-all transform active:scale-95 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-accent hover:bg-[#A8802E] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-lg transition-all transform active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* SECTION 5: Security Settings Section */}
          <div id="security-section" className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu will-change-transform">
            <div className="pb-4.5 border-b border-slate-100 mb-6">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>🔐</span> <span>Security Settings</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Password update Form */}
              <form onSubmit={handleSecuritySave} className="md:col-span-7 space-y-4">
                {[
                  { key: 'currentPassword', label: 'Current Password', type: 'password' },
                  { key: 'newPassword', label: 'New Password', type: 'password' },
                  { key: 'confirmPassword', label: 'Confirm Password', type: 'password' }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={security[field.key]}
                      onChange={(e) => setSecurity(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs focus:bg-white focus:ring-4 focus:ring-accent/15 focus:border-accent transition-all duration-300 font-medium"
                      required
                    />
                  </div>
                ))}
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-accent hover:bg-[#A8802E] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-lg transition-all transform active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* 2FA and login devices activity */}
              <div className="md:col-span-5 space-y-6 md:border-l md:border-slate-100 md:pl-8">
                {/* 2FA Toggle */}
                <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-extrabold text-xs text-[#0B1F4D]">Two-Factor Authentication</h5>
                    <button
                      onClick={handleTwoFactorToggle}
                      className={`h-5 w-10 rounded-full transition-all duration-300 cursor-pointer relative ${
                        twoFactorActive ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all duration-300 ${
                        twoFactorActive ? 'left-[22px]' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-light">Secure your consultant credentials with temporary token validations.</p>
                </div>

                {/* Login Devices list */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Active Device Sessions</h5>
                  
                  <div className="space-y-2">
                    {activeSessions.length > 0 ? activeSessions.map((dev) => {
                      const isMobile = dev.device === 'Mobile';
                      const isTablet = dev.device === 'Tablet';
                      const icon = isMobile ? '📱' : (isTablet ? '💊' : '💻'); // Just a quick emoji
                      const lastActiveStr = new Date(dev.lastActive).toLocaleString();
                      
                      // For simplicity, we just assume the latest session in the array might be the current, 
                      // or just show "Revoke" for all of them. Usually, we'd check against a current sessionId.
                      // Let's just make the newest one "Current" visually if it's the last in the list, 
                      // or better, don't allow revoking the latest one.
                      const isLatest = dev._id === activeSessions[activeSessions.length - 1]?._id;

                      return (
                        <div key={dev._id} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl text-xs font-semibold">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="text-xl bg-slate-50 p-1.5 rounded border border-slate-100">{icon}</span>
                            <div className="min-w-0">
                              <h6 className="text-[#0B1F4D] text-xs font-extrabold truncate">{`${dev.os} • ${dev.ip}`}</h6>
                              <p className="text-[9.5px] text-slate-400 font-light mt-0.5">{`${dev.browser} • Last active: ${lastActiveStr}`}</p>
                            </div>
                          </div>
                          {isLatest ? (
                            <span className="bg-emerald-500/15 text-emerald-600 text-[8.5px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase shrink-0">Current</span>
                          ) : (
                            <button onClick={() => handleRevokeSession(dev._id)} className="text-rose-500 hover:text-rose-600 text-[9.5px] font-black hover:underline cursor-pointer shrink-0">Revoke</button>
                          )}
                        </div>
                      );
                    }) : (
                      <p className="text-[10px] text-slate-500">No active sessions found.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECTION 7: Purchased Courses Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu will-change-transform">
            <div className="flex items-center justify-between pb-4.5 border-b border-slate-100 mb-6">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>📚</span> <span>Purchased Courses ({ENROLLED_COURSES.length})</span>
              </h3>
              <button onClick={() => onNavigate('courses')} className="text-accent hover:underline text-xs font-bold focus:outline-none cursor-pointer">Find Courses →</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {ENROLLED_COURSES.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-50/50 border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-44 hover:border-accent/30 hover:shadow transition-all duration-300 group"
                >
                  <div className="p-4 flex-grow space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <span className="bg-slate-200/80 text-slate-700 text-[8.5px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                        {course.id.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-accent font-extrabold uppercase tracking-wide">{course.progress}% done</span>
                    </div>
                    <h4 className="text-[#0B1F4D] font-black text-xs group-hover:text-accent transition-colors leading-tight line-clamp-2 mt-1">{course.title}</h4>
                    <p className="text-slate-400 text-[9.5px] font-medium mt-0.5">Instructor: {course.mentor}</p>
                  </div>

                  <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold">Last active: {course.lastAccessed}</span>
                    <button
                      onClick={() => onNavigate('course-detail', course.id)}
                      className="text-accent hover:underline text-[9.5px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 9: Learning Progress Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu will-change-transform">
            <div className="pb-4.5 border-b border-slate-100 mb-6">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>📊</span> <span>Learning Analytics Progress</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Hours Study', value: `${STUDENT_PROFILE.hoursLearned} hrs`, perc: 85, color: 'text-accent', stroke: '#C89B3C' },
                { label: 'Syllabus Completion', value: `${STUDENT_PROFILE.overallProgress}%`, perc: STUDENT_PROFILE.overallProgress, color: 'text-emerald-500', stroke: '#10B981' },
                { label: 'Exam Readiness score', value: `${STUDENT_PROFILE.examReadyScore}%`, perc: STUDENT_PROFILE.examReadyScore, color: 'text-blue-500', stroke: '#3B82F6' },
                { label: 'Weekly Active Rate', value: '92%', perc: 92, color: 'text-indigo-500', stroke: '#6366F1' }
              ].map((prog, idx) => (
                <div key={idx} className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex flex-col items-center justify-between space-y-3.5">
                  <div className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider text-center line-clamp-1">{prog.label}</div>
                  
                  {/* Circle SVG Progress tracker */}
                  <div className="relative h-20 w-20 flex items-center justify-center">
                    <svg className="h-full w-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        stroke={prog.stroke}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 32}
                        strokeDashoffset={2 * Math.PI * 32 * (1 - prog.perc / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className="absolute text-slate-800 font-black text-xs">{prog.value}</span>
                  </div>

                  <span className="text-[9.5px] text-slate-500 font-bold text-center">Calibrated Target Checked</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 12: Recent Activity Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu will-change-transform">
            <div className="pb-4.5 border-b border-slate-100 mb-6">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>⏱️</span> <span>Recent Activity Timeline</span>
              </h3>
            </div>

            <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-6 text-xs text-slate-600">
              {[
                { title: 'Completed Brain MRI Staging Module', desc: 'Finished Stroke CT signs differents checks.', time: '2 hours ago', icon: '🧠' },
                { title: 'Attended Live spotter classes', desc: 'Participated in FRCR Part 2B Rapid Spotters board.', time: 'Yesterday', icon: '🎥' },
                { title: 'Attempted Physics mock assessment', desc: 'Scored 88% on Calibrated Physics set 4 preps.', time: '3 days ago', icon: '📝' },
                { title: 'Downloaded Course Completion Emblems', desc: 'FRCR Physics certification locked.', time: '5 days ago', icon: '🏆' }
              ].map((act, aIdx) => (
                <div key={aIdx} className="relative">
                  {/* Bullet */}
                  <span className="absolute -left-[35px] top-0.5 h-4.5 w-4.5 rounded-full bg-accent border-2 border-white flex items-center justify-center text-[9px] shadow-sm">
                    {act.icon}
                  </span>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h5 className="font-extrabold text-[#0B1F4D] text-xs uppercase tracking-wide">{act.title}</h5>
                      <span className="text-[9px] text-slate-400 shrink-0 ml-4">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-light leading-relaxed">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Subscription, Certificates, preferences, saved, help */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* SECTION 6: My Subscription Section */}
          <div className="bg-gradient-to-br from-[#0B1F4D] to-[#040812] border border-accent/25 rounded-3xl p-6 shadow-lg text-left space-y-4 relative overflow-hidden transform-gpu will-change-transform">
            <div className="absolute top-0 right-0 bg-accent text-[#060B18] text-[8.5px] font-black px-3.5 py-1.5 uppercase tracking-wider rounded-bl-xl shadow">
              Plan Active
            </div>
            
            <div className="space-y-1 pb-3 border-b border-white/10">
              <span className="text-[9px] text-accent font-extrabold uppercase tracking-widest">Active License</span>
              <h4 className="text-white font-black text-sm uppercase tracking-wide leading-tight mt-1">{STUDENT_PROFILE.subscriptionType}</h4>
            </div>

            <div className="space-y-2 text-[10.5px] text-slate-300 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">📅 Purchase Date:</span>
                <span>Jan 15, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">⏳ Expiry Date:</span>
                <span>Jan 15, 2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">⏳ Remaining Days:</span>
                <span className="text-accent font-bold">234 Days Left</span>
              </div>
            </div>

            {/* Features list */}
            <div className="pt-2.5 border-t border-white/10 space-y-2">
              <h5 className="font-extrabold text-[9.5px] text-slate-400 uppercase tracking-widest">Access Checklist Included:</h5>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9.5px] font-bold text-slate-200">
                {['✔ Live Classes', '✔ Replays Replays', '✔ Mock Exams', '✔ DICOM Scans', '✔ DailyRevision', '✔ 3D Anatomy'].map((feat, fIdx) => (
                  <div key={fIdx} className="truncate">{feat}</div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-3">
              <button onClick={() => alert('Launching Payment upgrade portal...')} className="w-full text-center py-2 text-[9.5px] font-black uppercase tracking-widest text-[#060B18] bg-accent rounded-lg border border-transparent hover:bg-[#A8802E] active:scale-95 transition-all cursor-pointer">
                Upgrade
              </button>
              <button onClick={() => alert('Initiating license renewal...')} className="w-full text-center py-2 text-[9.5px] font-black uppercase tracking-widest text-white bg-transparent rounded-lg border border-accent hover:bg-accent/15 active:scale-95 transition-all cursor-pointer">
                Renew
              </button>
            </div>
          </div>

          {/* SECTION 8: Certificates Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu will-change-transform">
            <div className="pb-4.5 border-b border-slate-100 mb-4">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>🏆</span> <span>My Certificates</span>
              </h3>
            </div>

            <div className="space-y-4">
              {[
                { title: 'FRCR Part 1 Physics emblem', course: 'Physics & Anatomy Calibration', code: 'RCR-PHYS-8942' },
                { title: 'Stroke T2/DWI Diagnostics', course: 'Brain MRI Interpretation Masterclass', code: 'SRRA-NEUR-4521' }
              ].map((cert, cIdx) => (
                <div key={cIdx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl bg-white p-2 rounded-xl border border-slate-150 shadow-inner">📜</span>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-[#0B1F4D] truncate">{cert.title}</h4>
                      <p className="text-[9.5px] text-slate-400 font-medium truncate mt-0.5">{cert.course}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 bg-white p-2 rounded-xl border border-slate-100">
                    <span>ID: {cert.code}</span>
                    <span className="text-emerald-500 uppercase tracking-widest">Verified</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => alert(`Downloading PDF certificate for ${cert.title}`)} className="text-center py-2 text-[9.5px] font-black uppercase tracking-widest text-[#060B18] bg-accent rounded-lg border border-transparent hover:bg-[#A8802E] transition-all cursor-pointer">
                      Download
                    </button>
                    <button onClick={() => alert('Launching online verification frame...')} className="text-center py-2 text-[9.5px] font-black uppercase tracking-widest text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer">
                      View Online
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 10: Saved Items Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu will-change-transform">
            <div className="pb-4.5 border-b border-slate-100 mb-4">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>📁</span> <span>Saved Workspace Items</span>
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Brain MRI Interpretation course', type: 'Saved Course', route: 'courses' },
                { title: 'Aortic dissection Stanford B CT scan', type: 'DICOM Case Study', route: 'cases' },
                { title: 'Stroke T2 Differential checklists', type: 'Saved Note', route: 'notes' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 rounded-2xl text-xs font-semibold">
                  <div className="min-w-0">
                    <span className="bg-slate-150 text-slate-500 text-[8.5px] font-black px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-widest">{item.type}</span>
                    <h5 className="text-[#0B1F4D] text-xs font-extrabold truncate mt-2">{item.title}</h5>
                  </div>
                  <button
                    onClick={() => setActiveTab(item.route)}
                    className="text-accent hover:underline text-[9.5px] font-black uppercase tracking-wider cursor-pointer ml-3 shrink-0"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 11: Account Preferences Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu will-change-transform">
            <div className="pb-4.5 border-b border-slate-100 mb-4">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>⚙️</span> <span>Account Preferences</span>
              </h3>
            </div>

            <div className="space-y-5 text-xs font-semibold">
              {/* Theme Preference toggle */}
              <div className="flex justify-between items-center p-1.5 border border-slate-100 rounded-2xl bg-slate-50">
                <span className="text-[#0B1F4D] font-extrabold text-xs pl-2.5">Portal Theme Style</span>
                <div className="flex space-x-1">
                  {['light', 'dark'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handlePreferenceChange('theme', t)}
                      className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all duration-300 ${
                        preferences.theme === t
                          ? 'bg-[#0B1F4D] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-2">
                <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Notification Channels</h5>
                
                <div className="space-y-2.5">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications' },
                    { key: 'smsAlerts', label: 'SMS Alerts' },
                    { key: 'liveClassReminder', label: 'Live Class Reminders' },
                    { key: 'dailyMcqReminder', label: 'Daily Revision Reminders' }
                  ].map((notif) => (
                    <label key={notif.key} className="flex justify-between items-center cursor-pointer p-1.5 hover:bg-slate-50 rounded-xl transition-all">
                      <span className="text-slate-600 font-medium">{notif.label}</span>
                      <button
                        type="button"
                        onClick={() => togglePreference(notif.key)}
                        className={`h-4.5 w-9 rounded-full transition-all duration-300 relative ${
                          preferences[notif.key] ? 'bg-[#C89B3C]' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 h-3.5 w-3.5 bg-white rounded-full transition-all duration-300 ${
                          preferences[notif.key] ? 'left-[18px]' : 'left-0.5'
                        }`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>

              {/* Language selection dropdown placeholder */}
              <div className="pt-2">
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Language preference</label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/15 focus:border-accent transition-all duration-300 font-medium"
                >
                  <option value="English">English (United Kingdom)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                </select>
              </div>

            </div>
          </div>

          {/* SECTION 13: Help & Support Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 transform-gpu will-change-transform">
            <div className="pb-4.5 border-b border-slate-100 mb-4">
              <h3 className="text-[#0B1F4D] font-extrabold text-base uppercase tracking-wider flex items-center space-x-2">
                <span>🎧</span> <span>Help & Support Channels</span>
              </h3>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Consultant Live Support', desc: 'Direct live text channels with RCR specialists.', icon: '💬', action: 'Chat Support' },
                { title: 'System Technical Helpdesk', desc: 'Submit logs or report PACS DICOM browser bugs.', icon: '📨', action: 'Raise Ticket' }
              ].map((sup, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left space-y-3">
                  <div className="flex items-start space-x-2.5">
                    <span className="text-xl bg-white p-2 rounded-xl border border-slate-150 shrink-0">
                      {sup.icon}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#0B1F4D]">{sup.title}</h4>
                      <p className="text-[9.5px] text-slate-400 font-light mt-0.5 leading-relaxed">{sup.desc}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Initiating ${sup.title} session...`)}
                    className="w-full text-[9.5px] font-black py-2.5 uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transform active:scale-95 transition-all"
                  >
                    {sup.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ProfileSettingsTab;
