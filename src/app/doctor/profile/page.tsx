"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppShell from '../../../components/AppShell';
import Dropdown from '../../../components/Dropdown';
import { navigateTo } from '../../../utils/navigation';
import { 
  LogOut, 
  AlertCircle,
  RefreshCw,
  Plus,
  X,
  Camera,
  Mail,
  Phone,
  UserCircle2,
  ArrowLeft
} from 'lucide-react';
import {
  useDoctorSummary,
  useDoctorProfile,
  useUpdateDoctorStatus,
  useUpdateDoctorProfile,
  useDeleteDoctorProfile,
  useUpdateDoctorProfilePicture
} from '../../../lib/service/query/useDoctor';
import { useUploadFile } from '../../../lib/service/query/useUpload';
import { getApiErrorMessage } from '../../../utils/errors';
import { useAlert } from '../../../context/AlertContext';

export default function DoctorProfilePage() {
  const [isActive, setIsActive] = useState(true);
  const { showAlert } = useAlert();

  // React Query server integrations
  const { data: realSummary, isLoading: isSummaryLoading, error: summaryError } = useDoctorSummary();
  const { data: realProfile, isLoading: isProfileLoading, error: profileError } = useDoctorProfile();
  const updateStatusMutation = useUpdateDoctorStatus();
  const updateProfileMutation = useUpdateDoctorProfile();
  const updateProfilePictureMutation = useUpdateDoctorProfilePicture();
  const uploadFileMutation = useUploadFile();
  const deleteProfileMutation = useDeleteDoctorProfile();

  // Profile editing states
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profileGender, setProfileGender] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhoneNumber, setProfilePhoneNumber] = useState('');
  const [profileBioText, setProfileBioText] = useState('');
  const [profileLanguages, setProfileLanguages] = useState<string[]>([]);
  const [profileQualifications, setProfileQualifications] = useState<string[]>([]);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [profileDocuments, setProfileDocuments] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if user is unauthorized/not logged in
  useEffect(() => {
    if (summaryError || profileError) {
      console.error("Profile page authorization check failed:", summaryError || profileError);
      navigateTo('/doctor/login');
    }
  }, [summaryError, profileError]);

  // Populate form states once profile is loaded
  useEffect(() => {
    if (realProfile) {
      setProfileFirstName(realProfile.firstName || '');
      setProfileLastName(realProfile.lastName || '');
      setProfileGender(realProfile.gender || '');
      setProfileEmail(realProfile.email || '');
      setProfilePhoneNumber(realProfile.phoneNumber || '');
      setProfileBioText(realProfile.professionalBio || '');
      setProfileLanguages(realProfile.languages || []);
      setProfileQualifications(realProfile.qualifications || []);
      setProfileImagePreview(realProfile.profilePicture || null);

      // Parse documents
      let docsList: string[] = [];
      if (realProfile.documents) {
        realProfile.documents.forEach(docStr => {
          if (docStr) {
            docStr.split(',').forEach(url => {
              const trimmed = url.trim();
              if (trimmed) docsList.push(trimmed);
            });
          }
        });
      }
      setProfileDocuments(docsList);
    }
  }, [realProfile]);

  // Automatically enable server database mode if doctor summary data is successfully retrieved
  useEffect(() => {
    if (realSummary) {
      setIsActive(realSummary.status === "ACTIVE");
    }
  }, [realSummary]);

  // Safety net: if the doctor lands here directly with an incomplete profile, send them to onboarding
  useEffect(() => {
    if (realProfile && realProfile.isProfileComplete === false) {
      navigateTo('/doctor/complete-profile');
    }
  }, [realProfile]);

  // Toggle active accepting status
  const handleToggleActive = async () => {
    const nextState = !isActive;
    setIsActive(nextState);
    try {
      await updateStatusMutation.mutateAsync(nextState ? "ACTIVE" : "PAUSED");
      showAlert(`Status updated to ${nextState ? "Online" : "Offline"} successfully.`, "success");
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to update status on server.')}`, "error");
      setIsActive(isActive);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showAlert("Image size exceeds the 5MB limit.", "warning");
      return;
    }
    setProfileImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setProfileImagePreview(localUrl);
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showAlert("Document size exceeds 10MB limit.", "warning");
      return;
    }
    try {
      const uploadedUrl = await uploadFileMutation.mutateAsync({
        file: file,
        folder: 'doctor-certifications'
      });
      setProfileDocuments(prev => [...prev, uploadedUrl]);
      showAlert("Document uploaded successfully!", "success");
    } catch (err: any) {
      showAlert(`Upload failed: ${getApiErrorMessage(err, 'Failed to upload document.')}`, "error");
    }
  };

  const handleRemoveDocument = (index: number) => {
    setProfileDocuments(prev => prev.filter((_, i) => i !== index));
    showAlert("Document queued for removal. Click Save to apply changes.", "info");
  };

  const handleAddQualification = () => {
    setProfileQualifications(prev => [...prev, '']);
  };

  const handleRemoveQualification = (index: number) => {
    setProfileQualifications(prev => prev.filter((_, i) => i !== index));
  };

  const handleQualificationChange = (index: number, val: string) => {
    setProfileQualifications(prev => prev.map((q, i) => i === index ? val : q));
  };

  const handleToggleLanguage = (lang: string) => {
    setProfileLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      let finalImageUrl = profileImagePreview;

      if (profileImageFile) {
        const uploadedUrl = await uploadFileMutation.mutateAsync({
          file: profileImageFile,
          folder: 'doctor-profile-pictures'
        });
        finalImageUrl = uploadedUrl;
        await updateProfilePictureMutation.mutateAsync(uploadedUrl);
        setProfileImageFile(null);
      }

      await updateProfileMutation.mutateAsync({
        firstName: profileFirstName,
        lastName: profileLastName,
        gender: profileGender,
        email: profileEmail,
        professionalBio: profileBioText,
        languages: profileLanguages,
        qualifications: profileQualifications.map(q => q.trim()).filter(Boolean),
        slmcLicenseNumber: realProfile?.slmcLicenseNumber,
        documents: profileDocuments.length > 0 ? [profileDocuments.join(',')] : [],
      });

      showAlert("Profile updated successfully!", "success");
    } catch (err: any) {
      showAlert(`Error updating profile: ${getApiErrorMessage(err, 'Check your connections.')}`, "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toLowerCase() !== 'delete') return;

    setIsDeletingProfile(true);
    try {
      await deleteProfileMutation.mutateAsync();
      showAlert("Your profile has been successfully deactivated.", "success");
      setShowDeleteModal(false);
      setDeleteConfirmationText('');
      navigateTo('/doctor/login');
    } catch (err: any) {
      showAlert(`Error deactivating profile: ${getApiErrorMessage(err, 'Failed to delete account.')}`, "error");
    } finally {
      setIsDeletingProfile(false);
    }
  };

  if (isSummaryLoading || isProfileLoading) {
    return (
      <AppShell>
        <div className="bg-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
            <div className="bg-[#142B22]/10 h-44 rounded-3xl border border-hairline" />
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="flex flex-col items-center space-y-6 border-r border-hairline pr-0 lg:pr-8">
                  <div className="w-32 h-32 rounded-full bg-cream" />
                  <div className="h-4 bg-cream w-2/3 rounded mt-4" />
                  <div className="h-3 bg-cream w-1/2 rounded" />
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-6 bg-cream w-1/3 rounded mb-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-cream rounded-xl" />
                    <div className="h-10 bg-cream rounded-xl" />
                  </div>
                  <div className="h-24 bg-cream rounded-xl" />
                  <div className="h-10 bg-cream rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const docName = realSummary
    ? `Dr. ${realSummary.firstName}`
    : "Dr. Kaveesh";

  const docSlmc = realSummary
    ? realSummary.slmcLicenseNumber || "9321"
    : "9321";

  const docCategory = realSummary && realSummary.category
    ? realSummary.category.replace(/_/g, " ")
    : "Clinical Psychologist";

  const docFee = realSummary
    ? `${realSummary.approvedCustomPriceLkr || "3,500"}`
    : "3,500";

  return (
    <AppShell>
      <div className="bg-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Back Button */}
          <button 
            onClick={() => navigateTo('/doctor/dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs text-forest hover:underline font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          {/* Header Banner - Responsive Design */}
          <div className="bg-gradient-to-r from-[#142B22] to-[#1E4B3A] text-white p-6 sm:p-8 rounded-3xl shadow-resting flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8FCB84] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />
            
            <div className="relative z-10 w-full md:max-w-xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold break-words leading-tight">
                Ayubowan, {docName}
              </h1>
            </div>

            {/* Quick Availability Switch & Logout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full md:w-auto shrink-0">
              <div className="bg-[#0B1E17] border border-[#2B4E41] px-4 py-2.5 rounded-2xl flex items-center justify-between sm:justify-start space-x-3 text-sm">
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-mint animate-pulse' : 'bg-gray-400'}`} />
                  <span className="font-semibold text-xs uppercase tracking-wider">
                    {isActive ? 'Accepting Patients' : 'Offline'}
                  </span>
                </div>
                <button
                  onClick={handleToggleActive}
                  disabled={updateStatusMutation.isPending}
                  className="bg-white hover:bg-cream text-forest text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  id="doctor-status-toggle"
                >
                  Change
                </button>
              </div>

              <button
                onClick={() => navigateTo('/doctor/login')}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 text-xs font-bold"
                id="doctor-logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Profile & Settings Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Picture & Account Management */}
                <div className="flex flex-col items-center space-y-6 border-b pb-6 lg:border-b-0 lg:pb-0 lg:border-r lg:pr-8">
                  <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-mint bg-cream flex items-center justify-center shadow-inner cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileImagePreview ? (
                      <img 
                        src={profileImagePreview} 
                        alt="Doctor Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="w-20 h-20 text-sprout" />
                    )}
                    <div className="absolute inset-0 bg-[#0B1E17]/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Image</span>
                    </div>
                  </div>

                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfileImageChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="text-center space-y-1 w-full">
                    <h4 className="font-display font-bold text-forest text-sm break-words">{docName}</h4>
                    <div className="flex flex-col gap-1 items-center">
                      <span className="text-[10px] bg-[#FAF9F5] border border-hairline text-ink-soft px-2.5 py-0.5 rounded-full font-mono font-medium">
                        {docCategory}
                      </span>
                      <span className="text-[10px] bg-mint/20 text-forest px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        SLMC-{docSlmc}
                      </span>
                    </div>
                  </div>

                  <div className="w-full pt-6 border-t border-hairline">
                    <div className="p-4 bg-red-50/50 border border-red-200/50 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Deactivate Profile</span>
                      </h4>
                      <p className="text-[11px] text-red-700/80 leading-relaxed">
                        Deactivating your profile will remove your clinic card from the public patient-facing directory.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Delete Doctor Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Editable Forms */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase font-bold text-forest tracking-wider border-b border-hairline pb-1.5">Personal & Contact Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-ink-soft mb-1.5">First Name</label>
                        <input
                          type="text"
                          required
                          value={profileFirstName}
                          onChange={(e) => setProfileFirstName(e.target.value)}
                          className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-soft mb-1.5">Last Name</label>
                        <input
                          type="text"
                          required
                          value={profileLastName}
                          onChange={(e) => setProfileLastName(e.target.value)}
                          className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-ink-soft mb-1.5">Email Address</label>
                        <input
                          type="email"
                          required
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-soft mb-1.5">Phone Number</label>
                        <input
                          type="text"
                          disabled
                          value={profilePhoneNumber}
                          className="w-full bg-gray-100 border border-hairline rounded-xl px-4 py-3 text-sm text-gray-500 outline-none"
                        />
                        <span className="text-[10px] text-ink-soft mt-1 block">Contact support or use security settings to verify phone updates.</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1.5">Gender</label>
                      <Dropdown
                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' },
                          { value: 'Other', label: 'Other' },
                          { value: 'Prefer not to say', label: 'Prefer not to say' }
                        ]}
                        value={profileGender}
                        onChange={(val) => setProfileGender(val)}
                        placeholder="Select Gender"
                        id="profile-gender"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-xs uppercase font-bold text-forest tracking-wider border-b border-hairline pb-1.5">Professional Biography & Languages</h3>

                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1.5">Doctor Biography Card</label>
                      <textarea
                        rows={4}
                        required
                        value={profileBioText}
                        onChange={(e) => setProfileBioText(e.target.value)}
                        className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all leading-relaxed"
                        placeholder="Describe your telehealth counseling expertise..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-2">Spoken Languages</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {['Sinhala', 'Tamil', 'English'].map(lang => {
                          const isSelected = profileLanguages.includes(lang);
                          return (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => handleToggleLanguage(lang)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                                isSelected
                                  ? 'bg-mint/20 border-mint text-forest'
                                  : 'bg-cream border-hairline text-ink-soft hover:border-forest/30'
                              }`}
                            >
                              {lang}
                            </button>
                          );
                        })}
                        {profileLanguages.filter(l => !['Sinhala', 'Tamil', 'English'].includes(l)).map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => handleToggleLanguage(lang)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-mint/20 border border-mint text-forest cursor-pointer flex items-center gap-1"
                          >
                            <span>{lang}</span>
                            <X className="w-3 h-3 text-forest" />
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 max-w-xs">
                        <input
                          type="text"
                          id="custom-lang-input"
                          placeholder="Other language (e.g. German)..."
                          className="bg-cream border border-hairline rounded-xl px-3 py-1.5 text-xs text-forest outline-none focus:border-forest"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val && !profileLanguages.includes(val)) {
                                setProfileLanguages(prev => [...prev, val]);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('custom-lang-input') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val && !profileLanguages.includes(val)) {
                              setProfileLanguages(prev => [...prev, val]);
                              input.value = '';
                            }
                          }}
                          className="bg-forest text-[#FAF9F5] hover:bg-forest/90 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold text-ink-soft">Qualifications</label>
                        <button
                          type="button"
                          onClick={handleAddQualification}
                          className="text-forest hover:text-mint text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Qualification</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        {profileQualifications.map((q, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={q}
                              onChange={(e) => handleQualificationChange(idx, e.target.value)}
                              placeholder="e.g. Master of Clinical Psychology (University of Colombo)"
                              className="flex-1 bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-3 py-2 text-xs text-forest outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveQualification(idx)}
                              className="text-ink-soft hover:text-red-600 p-2 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {profileQualifications.length === 0 && (
                          <p className="text-xs text-ink-soft italic">No qualifications added. Please add at least one.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold text-ink-soft">Uploaded Certifications & Documents</label>
                        <button
                          type="button"
                          onClick={() => documentInputRef.current?.click()}
                          disabled={uploadFileMutation.isPending}
                          className="text-forest hover:text-mint text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Document</span>
                        </button>
                      </div>
                      <input 
                        type="file"
                        ref={documentInputRef}
                        onChange={handleUploadDocument}
                        accept=".pdf,image/*"
                        className="hidden"
                      />
                      
                      <div className="space-y-2">
                        {profileDocuments.map((docUrl, idx) => {
                          const fileName = docUrl.split('/').pop() || `Document-${idx + 1}`;
                          return (
                            <div key={idx} className="flex items-center justify-between bg-cream/30 border border-hairline rounded-xl px-3 py-2 text-xs">
                              <a 
                                href={docUrl.startsWith('http') ? docUrl : `https://hitha-server.beetlecode.com${docUrl}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-forest hover:underline font-mono truncate max-w-[200px] sm:max-w-md block"
                              >
                                {fileName}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(idx)}
                                className="text-ink-soft hover:text-red-600 p-1 cursor-pointer shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                        {profileDocuments.length === 0 && (
                          <p className="text-xs text-ink-soft italic">No certification documents uploaded.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-hairline flex justify-end">
                    <button 
                      type="submit"
                      disabled={isSavingProfile || uploadFileMutation.isPending}
                      className="bg-forest text-white hover:bg-forest/90 text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                    >
                      {(isSavingProfile || uploadFileMutation.isPending) && (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      )}
                      <span>Save Profile Adjustments</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E17]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-hairline w-full max-w-md p-6 rounded-3xl shadow-elevated space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-forest">Deactivate Doctor Profile</h3>
            </div>
            
            <p className="text-xs text-ink-soft leading-relaxed">
              This action is permanent and irreversible. Your doctor profile will be deactivated, and your details will be completely removed from the public directories.
            </p>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink-soft">
                Type the word <span className="font-bold text-red-600 font-mono">"delete"</span> below to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="delete"
                className="w-full bg-cream border border-hairline focus:border-red-500 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all font-mono"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                className="flex-1 bg-cream hover:bg-cream/80 text-forest text-xs font-bold py-3 rounded-xl border border-hairline transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText.trim().toLowerCase() !== 'delete' || isDeletingProfile}
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingProfile ? 'Deactivating...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
