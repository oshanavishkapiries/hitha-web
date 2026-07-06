import React from 'react';
import {
  IconMail,
  IconPhone,
  IconLanguage,
  IconCertificate,
  IconFileText,
  IconUserCircle,
} from '@tabler/icons-react';
import { DoctorProfileDetail } from '../lib/service/functions/admin.service';

interface DoctorDetailCardProps {
  doctor: DoctorProfileDetail;
}

export default function DoctorDetailCard({ doctor }: DoctorDetailCardProps) {
  return (
    <div className="space-y-5">
      {/* Header block */}
      <div className="flex items-center gap-4 pb-4 border-b border-hairline">
        <div className="w-16 h-16 rounded-full bg-mint/10 border border-mint/30 flex items-center justify-center overflow-hidden shrink-0">
          {doctor.profilePicture ? (
            <img src={doctor.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <IconUserCircle className="w-9 h-9 text-mint" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-display font-bold text-forest truncate">
            {doctor.firstName} {doctor.lastName}
          </h4>
          <p className="text-[11px] text-ink-soft mt-0.5">{doctor.category ? doctor.category.replace(/_/g, " ") : "Counseling Specialist"}</p>
          <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            doctor.status === 'ACTIVE' ? 'bg-mint/20 text-forest'
              : doctor.status === 'SUSPENDED' ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {doctor.status}
          </span>
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-start gap-2">
          <IconMail className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
          <div>
            <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Email</span>
            <span className="text-forest font-semibold break-all">{doctor.email || "N/A"}</span>
            {doctor.isEmailVerified && <span className="ml-1 text-[9px] text-mint font-bold">(Verified)</span>}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <IconPhone className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
          <div>
            <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Phone Number</span>
            <span className="text-forest font-semibold">{doctor.phoneNumber || "N/A"}</span>
            {doctor.isMobileNumberVerified && <span className="ml-1 text-[9px] text-mint font-bold">(Verified)</span>}
          </div>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">SLMC Registration No</span>
          <span className="text-forest font-mono font-semibold">{doctor.slmcLicenseNumber || "N/A"}</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Gender</span>
          <span className="text-forest font-semibold">{doctor.gender || "N/A"}</span>
        </div>
        {doctor.approvedCustomPriceLkr != null && (
          <div>
            <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Approved Custom Price</span>
            <span className="text-forest font-semibold">LKR {doctor.approvedCustomPriceLkr}</span>
          </div>
        )}
        <div>
          <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider">Profile Complete</span>
          <span className="text-forest font-semibold">{doctor.isProfileComplete ? "Yes" : "No"}</span>
        </div>
      </div>

      {/* Bio */}
      {doctor.professionalBio && (
        <div>
          <span className="block text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-1">Professional Bio</span>
          <p className="text-xs text-ink-soft leading-relaxed bg-[#FAF9F5] p-3 rounded-xl border border-hairline">
            {doctor.professionalBio}
          </p>
        </div>
      )}

      {/* Languages */}
      {doctor.languages && doctor.languages.length > 0 && (
        <div>
          <span className="text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-1.5 flex items-center gap-1">
            <IconLanguage className="w-3.5 h-3.5 text-mint" />
            <span>Languages</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {doctor.languages.map((lang, i) => (
              <span key={i} className="px-2.5 py-1 bg-mint/10 border border-mint/30 rounded-lg text-[10px] font-bold text-forest">{lang}</span>
            ))}
          </div>
        </div>
      )}

      {/* Qualifications */}
      {doctor.qualifications && doctor.qualifications.length > 0 && (
        <div>
          <span className="text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-1.5 flex items-center gap-1">
            <IconCertificate className="w-3.5 h-3.5 text-mint" />
            <span>Qualifications</span>
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-forest font-semibold">
            {doctor.qualifications.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Documents */}
      {doctor.documents && doctor.documents.length > 0 && (
        <div>
          <span className="text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-1.5 flex items-center gap-1">
            <IconFileText className="w-3.5 h-3.5 text-mint" />
            <span>Submitted Documents</span>
          </span>
          <div className="space-y-1.5">
            {doctor.documents.map((doc, i) => (
              <a
                key={i}
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-forest font-semibold underline hover:text-mint truncate"
              >
                <IconFileText className="w-3 h-3 shrink-0" />
                <span className="truncate">Document {i + 1}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
