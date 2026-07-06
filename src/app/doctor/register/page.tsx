"use client";

import React, { useState } from 'react';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { Lock, Mail, Phone, User, ShieldAlert, ArrowLeft, Stethoscope, BadgeCheck, Paperclip, X } from 'lucide-react';
import { useDoctorRegister } from '../../../lib/service/query/useAuth';
import { useUploadFile } from '../../../lib/service/query/useUpload';
import { DoctorRegRequest } from '../../../lib/service/functions/doctor.service';
import { getApiErrorMessage } from '../../../utils/errors';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const CATEGORY_OPTIONS: { value: DoctorRegRequest['category']; label: string }[] = [
  { value: 'COUNSELOR', label: 'Counselor' },
  { value: 'CLINICAL_COUNSELOR', label: 'Clinical Counselor' },
  { value: 'PSYCHOLOGIST', label: 'Psychologist' },
  { value: 'CLINICAL_PSYCHOLOGIST', label: 'Clinical Psychologist' },
  { value: 'MEDICAL_OFFICER_PSYCHIATRY_DIPLOMA', label: 'Medical Officer (Psychiatry Diploma)' },
  { value: 'CONSULTANT_PSYCHIATRIST', label: 'Consultant Psychiatrist' },
];

export default function DoctorRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [category, setCategory] = useState<DoctorRegRequest['category'] | ''>('');
  const [slmcLicenseNumber, setSlmcLicenseNumber] = useState('');
  const [certificationFiles, setCertificationFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

  const registerMutation = useDoctorRegister();
  const uploadFileMutation = useUploadFile();

  const requiresSlmc = category === 'MEDICAL_OFFICER_PSYCHIATRY_DIPLOMA' || category === 'CONSULTANT_PSYCHIATRIST';

  const handleCertificationFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const tooLarge = selected.filter(f => f.size > MAX_FILE_SIZE_BYTES);
    if (tooLarge.length > 0) {
      setError(`${tooLarge.map(f => f.name).join(', ')} exceed${tooLarge.length === 1 ? 's' : ''} the 10MB size limit.`);
    }
    setCertificationFiles(prev => [...prev, ...selected.filter(f => f.size <= MAX_FILE_SIZE_BYTES)]);
    e.target.value = '';
  };

  const removeCertificationFile = (index: number) => {
    setCertificationFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!category) {
      setError('Please select your professional category.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (requiresSlmc && !slmcLicenseNumber.trim()) {
      setError('SLMC license number is required for Medical Officers and Consultant Psychiatrists.');
      return;
    }

    try {
      let certifiedDocument: string | undefined;

      if (certificationFiles.length > 0) {
        setIsUploadingDocs(true);
        try {
          const uploadedUrls = await Promise.all(
            certificationFiles.map(file => uploadFileMutation.mutateAsync({ file, folder: 'doctor-certifications' }))
          );
          certifiedDocument = uploadedUrls.join(',');
        } catch (uploadErr: any) {
          setError(getApiErrorMessage(uploadErr, 'Failed to upload one or more certification documents.'));
          return;
        } finally {
          setIsUploadingDocs(false);
        }
      }

      const response = await registerMutation.mutateAsync({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        category,
        ...(slmcLicenseNumber.trim() ? { slmcLicenseNumber: slmcLicenseNumber.trim() } : {}),
        ...(certifiedDocument ? { certifiedDocument } : {}),
      });

      if (response.success) {
        navigateTo(`/doctor/verify-phone?identifier=${encodeURIComponent(phoneNumber)}`);
      } else {
        setError(response.message || 'Registration failed. Please review your details and try again.');
      }
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Registration request failed. Please check your connection and try again.'));
    }
  };

  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-3xl border border-hairline shadow-resting relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-mint via-forest to-moss" />

          <div className="text-center">
            <button
              onClick={() => navigateTo('/doctor/login')}
              className="inline-flex items-center space-x-1.5 text-xs text-ink-soft hover:text-forest mb-6 transition-colors cursor-pointer"
              id="doctor-register-back-login"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>
            <div className="mx-auto h-12 w-12 rounded-full bg-mint/10 flex items-center justify-center text-forest mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold text-forest">
              Register as a Doctor
            </h2>
            <p className="mt-2 text-xs text-ink-soft max-w-sm mx-auto">
              Create your Hitha consultation portal account. Your application will be reviewed after phone verification.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} id="doctor-register-form">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="Kaveesh"
                    id="doctor-register-firstname"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all"
                  placeholder="Alwis"
                  id="doctor-register-lastname"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                  placeholder="doctor@hitha.lk"
                  id="doctor-register-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                  placeholder="+94 77 123 4567"
                  id="doctor-register-phone"
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-soft">We'll send an SMS verification code to this number.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Professional Category</label>
              <select
                required
                value={category}
                onChange={(e) => {
                  const nextCategory = e.target.value as DoctorRegRequest['category'];
                  setCategory(nextCategory);
                  if (nextCategory !== 'MEDICAL_OFFICER_PSYCHIATRY_DIPLOMA' && nextCategory !== 'CONSULTANT_PSYCHIATRIST') {
                    setSlmcLicenseNumber('');
                  }
                }}
                className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all cursor-pointer"
                id="doctor-register-category"
              >
                <option value="" disabled>Select your category</option>
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {requiresSlmc && (
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                  SLMC License Number <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={slmcLicenseNumber}
                    onChange={(e) => setSlmcLicenseNumber(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="SLMC-12345"
                    id="doctor-register-slmc"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">
                Certification Documents <span className="text-ink-soft font-normal">(optional)</span>
              </label>
              <label
                htmlFor="doctor-register-certification-files"
                className="flex items-center justify-center gap-2 w-full border border-dashed border-hairline hover:border-forest/40 rounded-xl px-4 py-4 text-xs text-ink-soft cursor-pointer transition-all"
              >
                <Paperclip className="w-4 h-4" />
                <span>Click to attach SLMC certificates, degrees, or other supporting documents</span>
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleCertificationFilesChange}
                className="hidden"
                id="doctor-register-certification-files"
              />
              {certificationFiles.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {certificationFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between bg-cream border border-hairline rounded-lg px-3 py-2 text-xs text-ink"
                    >
                      <span className="truncate pr-2">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeCertificationFile(index)}
                        className="text-ink-soft hover:text-red-600 cursor-pointer shrink-0"
                        id={`doctor-register-remove-file-${index}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl pl-10 pr-4 py-3 text-sm text-ink outline-none transition-all"
                    placeholder="••••••••"
                    id="doctor-register-password"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-soft mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-cream border border-hairline focus:border-forest/50 focus:bg-white rounded-xl px-4 py-3 text-sm text-ink outline-none transition-all"
                  placeholder="••••••••"
                  id="doctor-register-confirm-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending || isUploadingDocs}
              className="w-full bg-forest hover:bg-forest/90 text-white font-sans font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-resting hover:shadow-elevated active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              id="doctor-register-submit"
            >
              {isUploadingDocs ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading Documents...</span>
                </>
              ) : registerMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <span>Create Doctor Account</span>
              )}
            </button>

            <p className="text-center text-xs text-ink-soft">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigateTo('/doctor/login')}
                className="text-forest font-semibold hover:underline cursor-pointer"
                id="doctor-register-login-link"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
