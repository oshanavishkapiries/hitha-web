import React, { useState } from 'react';
import { X, Star, Clock, Shield, User, ChevronRight, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useDoctorPublicDetail } from '../lib/service/query/useDiscovery';
import { SlotResponse } from '../lib/service/functions/discovery.service';

interface DoctorDetailModalProps {
  doctorId: string;
  onClose: () => void;
}

function formatTimeRange(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  return `${start.toLocaleTimeString('en-US', opts)} - ${end.toLocaleTimeString('en-US', opts)}`;
}

function slotDurationMinutes(startTime: string, endTime: string) {
  return Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
}

export default function DoctorDetailModal({ doctorId, onClose }: DoctorDetailModalProps) {
  const { data: doctor, isLoading, isError } = useDoctorPublicDetail(doctorId);

  const [selectedSlot, setSelectedSlot] = useState<SlotResponse | null>(null);
  const [bookingStep, setBookingStep] = useState<'details' | 'form' | 'success'>('details');
  const [nickname, setNickname] = useState('');
  const [contactMethod, setContactMethod] = useState<'video' | 'audio' | 'chat'>('video');
  const [referenceCode, setReferenceCode] = useState('');

  // Generate an elegant, privacy-first random animal nickname
  const getRandomNickname = () => {
    const adjectives = ['Calm', 'Gentle', 'Quiet', 'Peaceful', 'Mindful', 'Serene', 'Kind', 'Wise'];
    const nouns = ['Elephant', 'Peacock', 'Lotus', 'Cloud', 'Deer', 'Leaf', 'River', 'Forest'];
    const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${randAdj}${randNoun}${randNum}`;
  };

  const handleStartBooking = () => {
    if (!selectedSlot) return;
    setNickname(getRandomNickname());
    setBookingStep('form');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !doctor) return;
    // Generate secure reference token
    const randPart1 = Math.floor(1000 + Math.random() * 9000);
    const randPart2 = Math.floor(1000 + Math.random() * 9000);
    const generatedRef = `HT-${randPart1}-${randPart2}`;
    setReferenceCode(generatedRef);

    // Create new appointment object
    const newAppointment = {
      id: `apt-${Date.now()}`,
      referenceCode: generatedRef,
      doctorId: doctor.id,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      doctorPicture: doctor.profilePicture || '',
      timeRange: formatTimeRange(selectedSlot.startTime, selectedSlot.endTime),
      price: selectedSlot.priceLkr,
      duration: slotDurationMinutes(selectedSlot.startTime, selectedSlot.endTime),
      nickname: nickname,
      contactMethod: contactMethod,
      dateBooked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      const existing = localStorage.getItem('hitha_appointments');
      const list = existing ? JSON.parse(existing) : [];
      list.push(newAppointment);
      localStorage.setItem('hitha_appointments', JSON.stringify(list));

      // Dispatch a custom event to notify components that appointments changed
      window.dispatchEvent(new Event('hitha_appointments_updated'));
    } catch (err) {
      console.error('Failed to save appointment:', err);
    }

    setBookingStep('success');
  };

  // Helper to render saffron stars
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-saffron text-saffron" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative inline-block text-saffron">
            <Star className="w-4 h-4 text-hairline" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-4 h-4 fill-saffron text-saffron" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-hairline" />);
      }
    }
    return <div className="flex items-center space-x-0.5">{stars}</div>;
  };

  const averageRating =
    doctor && doctor.reviews.length > 0
      ? doctor.reviews.reduce((sum, r) => sum + r.rating, 0) / doctor.reviews.length
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      id="doctor-detail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-elevated border border-hairline relative"
        id="doctor-detail-modal"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-hairline bg-cream/30">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-forest" />
            <span className="text-xs font-sans font-bold text-forest uppercase tracking-wider">
              {bookingStep === 'details' && 'Practitioner Profile'}
              {bookingStep === 'form' && 'Secure Booking Details'}
              {bookingStep === 'success' && 'Booking Confirmed'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-cream text-ink-soft hover:text-ink transition-all focus:outline-none"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-ink-soft">
              <Loader2 className="w-8 h-8 animate-spin text-moss" />
              <p className="text-xs font-sans">Loading practitioner profile...</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-clay text-center">
              <AlertTriangle className="w-8 h-8" />
              <p className="text-xs font-sans font-semibold">Unable to load this doctor's profile right now.</p>
            </div>
          )}

          {doctor && bookingStep === 'details' && (
            <div className="space-y-8">
              {/* Doctor Header Intro */}
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <img
                  src={doctor.profilePicture || 'https://placehold.co/160x160?text=Dr'}
                  alt={`${doctor.firstName} ${doctor.lastName}`}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-2 border-sprout shadow-resting"
                />
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-2xl text-forest">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  {averageRating !== null ? (
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="flex items-center text-saffron">
                        {renderStars(averageRating)}
                        <span className="ml-1.5 font-sans font-semibold text-ink">{averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-hairline">|</span>
                      <span className="text-ink-soft text-xs">{doctor.reviews.length} Patient Reviews</span>
                    </div>
                  ) : (
                    <span className="text-ink-soft text-xs">No patient reviews yet</span>
                  )}
                </div>
              </div>

              {/* Bio & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-hairline">
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-display font-semibold text-base text-forest">About</h4>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                    {doctor.professionalBio || 'This practitioner has not added a biography yet.'}
                  </p>

                  {doctor.qualifications.length > 0 && (
                    <>
                      <h4 className="font-display font-semibold text-base text-forest pt-2">Qualifications</h4>
                      <ul className="space-y-1.5 list-none pl-0">
                        {doctor.qualifications.map((qual, idx) => (
                          <li key={idx} className="flex items-start text-xs text-ink-soft">
                            <span className="text-mint mr-2">✦</span>
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className="bg-cream/40 rounded-sub p-4 border border-hairline space-y-4">
                  <div>
                    <span className="block text-[11px] font-sans font-bold text-moss uppercase tracking-wider">Languages</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {doctor.languages.map((lang) => (
                        <span
                          key={lang}
                          className="bg-white px-2.5 py-0.5 rounded-full text-xs text-forest border border-hairline font-sans font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {doctor.gender && (
                    <div>
                      <span className="block text-[11px] font-sans font-bold text-moss uppercase tracking-wider">Gender</span>
                      <span className="block text-xs font-sans text-ink-soft mt-1">{doctor.gender}</span>
                    </div>
                  )}

                  {doctor.slotDurationMinutes != null && (
                    <div>
                      <span className="block text-[11px] font-sans font-bold text-moss uppercase tracking-wider">Session Length</span>
                      <span className="block text-xs font-sans text-ink-soft mt-1">{doctor.slotDurationMinutes} minutes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Slots */}
              <div className="pt-6 border-t border-hairline space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-display font-semibold text-base text-forest">Available Private Slots</h4>
                  <span className="text-xs text-ink-soft flex items-center">
                    <Clock className="w-3.5 h-3.5 text-moss mr-1" />
                    Secure Telehealth Video Call
                  </span>
                </div>

                {doctor.availableSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctor.availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full text-left p-4 rounded-sub border transition-all flex flex-col justify-between cursor-pointer focus:outline-none ${
                            isSelected
                              ? 'bg-sprout/30 border-forest/50 ring-2 ring-forest/20'
                              : 'bg-white border-hairline hover:bg-cream/40 hover:border-moss'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-sans font-semibold text-ink">
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </span>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-forest" />}
                          </div>
                          <div className="flex justify-between items-baseline mt-2">
                            <span className="text-[11px] font-sans text-ink-soft">
                              Duration: {slotDurationMinutes(slot.startTime, slot.endTime)} mins
                            </span>
                            <span className="font-mono text-sm font-semibold text-forest">
                              LKR {slot.priceLkr.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-ink-soft italic bg-cream/30 p-3 rounded-sub border border-dashed border-hairline text-center">
                    No open slots found for today. Please contact Hitha support to request a priority callback.
                  </p>
                )}

                {/* Extra time notice */}
                {selectedSlot && (
                  <div className="p-3 bg-cream/50 rounded-sub border border-hairline mt-2">
                    <p className="text-[11px] font-sans text-ink-soft">
                      <span className="font-semibold text-forest">Appointment Details:</span> Standard session is{' '}
                      <span className="font-mono font-medium">
                        {slotDurationMinutes(selectedSlot.startTime, selectedSlot.endTime)} minutes
                      </span>
                      .{' '}
                      {doctor.extraTimePriceLkr && doctor.extraTimeMinutes ? (
                        <>
                          If needed, you can extend the session for{' '}
                          <span className="font-mono text-forest font-semibold">
                            LKR {doctor.extraTimePriceLkr}
                          </span>{' '}
                          per additional <span className="font-mono">{doctor.extraTimeMinutes} minutes</span>.
                        </>
                      ) : (
                        'No additional extension charges apply.'
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Patient Reviews */}
              {doctor.reviews.length > 0 && (
                <div className="pt-6 border-t border-hairline space-y-4">
                  <h4 className="font-display font-semibold text-base text-forest">Patient Reviews</h4>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {doctor.reviews.map((rev) => (
                      <div key={rev.id} className="bg-cream/20 p-4 rounded-sub border border-hairline space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-sans font-semibold text-forest">{rev.reviewerNickname}</span>
                          <span className="font-sans text-ink-faint">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-saffron">{renderStars(rev.rating)}</div>
                        <p className="text-xs text-ink-soft leading-relaxed italic">"{rev.reviewText}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Action */}
              <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row justify-between items-center gap-4 bg-cream/20 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6">
                <div className="text-center sm:text-left">
                  {selectedSlot ? (
                    <p className="text-xs text-ink-soft">
                      Selected: <span className="font-semibold text-ink">{formatTimeRange(selectedSlot.startTime, selectedSlot.endTime)}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-clay font-medium">Please select an appointment slot to proceed</p>
                  )}
                </div>
                <button
                  disabled={!selectedSlot}
                  onClick={handleStartBooking}
                  className={`w-full sm:w-auto font-sans font-bold text-sm px-8 py-3.5 rounded-full shadow-resting transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    selectedSlot
                      ? 'bg-mint hover:bg-mint-dark text-mint-text hover:shadow-elevated'
                      : 'bg-ink-faint text-white cursor-not-allowed opacity-50'
                  }`}
                  id="book-slot-btn"
                >
                  <span>Book This Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {doctor && bookingStep === 'form' && (
            <form onSubmit={handleConfirmBooking} className="space-y-6">
              <div className="bg-sprout/20 border border-sprout/40 rounded-sub p-4 flex items-start space-x-3">
                <Shield className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-sans font-bold text-forest uppercase tracking-wider">Privacy Escrow Protocol</h4>
                  <p className="text-[11px] text-ink-soft leading-relaxed">
                    Hitha uses end-to-end anonymity. You do not need an account. We have pre-filled a secure pseudonym below which will represent you during the session.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-sans font-bold text-ink-soft">Anonymous Patient Nickname</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint w-4 h-4" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    placeholder="Enter an alias"
                    className="w-full bg-cream/50 hover:bg-cream/80 focus:bg-white text-ink text-sm rounded-sub pl-11 pr-4 py-3 border border-hairline focus:border-moss outline-none transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-ink-faint">
                  *The therapist will only see this temporary nickname. Your IP and physical location are never revealed.
                </p>
              </div>

              {/* Consultation Method */}
              <div className="space-y-3">
                <label className="block text-xs font-sans font-bold text-ink-soft">Anonymous Consultation Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setContactMethod('video')}
                    className={`p-3.5 rounded-sub border text-xs font-medium font-sans flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                      contactMethod === 'video'
                        ? 'bg-sprout/30 border-forest text-forest font-semibold'
                        : 'bg-white border-hairline text-ink-soft hover:bg-cream/30'
                    }`}
                  >
                    <span>Secure Video</span>
                    <span className="text-[9px] text-ink-faint font-normal">With camera block option</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactMethod('audio')}
                    className={`p-3.5 rounded-sub border text-xs font-medium font-sans flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                      contactMethod === 'audio'
                        ? 'bg-sprout/30 border-forest text-forest font-semibold'
                        : 'bg-white border-hairline text-ink-soft hover:bg-cream/30'
                    }`}
                  >
                    <span>Secure Audio</span>
                    <span className="text-[9px] text-ink-faint font-normal">Voice only, highly private</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactMethod('chat')}
                    className={`p-3.5 rounded-sub border text-xs font-medium font-sans flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                      contactMethod === 'chat'
                        ? 'bg-sprout/30 border-forest text-forest font-semibold'
                        : 'bg-white border-hairline text-ink-soft hover:bg-cream/30'
                    }`}
                  >
                    <span>Secure Live Chat</span>
                    <span className="text-[9px] text-ink-faint font-normal">No audio/video recorded</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-cream/50 p-4 rounded-sub border border-hairline space-y-3">
                <h5 className="text-xs font-sans font-bold text-forest">Consultation Summary</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Specialist:</span>
                    <span className="font-semibold text-ink">Dr. {doctor.firstName} {doctor.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Selected Slot:</span>
                    <span className="font-semibold text-ink">
                      {selectedSlot ? formatTimeRange(selectedSlot.startTime, selectedSlot.endTime) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Duration:</span>
                    <span className="font-semibold text-ink">
                      {selectedSlot ? slotDurationMinutes(selectedSlot.startTime, selectedSlot.endTime) : 0} mins
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-hairline pt-2 mt-2">
                    <span className="font-semibold text-forest">Total Due (LKR):</span>
                    <span className="font-mono font-bold text-forest">LKR {selectedSlot?.priceLkr.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setBookingStep('details')}
                  className="text-xs text-ink-soft hover:text-ink font-semibold"
                >
                  Back to Profile
                </button>
                <button
                  type="submit"
                  className="bg-mint hover:bg-mint-dark text-mint-text font-sans font-bold text-sm px-8 py-3.5 rounded-full shadow-resting transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  id="confirm-booking-btn"
                >
                  <span>Confirm Anonymous Slot</span>
                </button>
              </div>
            </form>
          )}

          {bookingStep === 'success' && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 bg-sprout/40 rounded-full flex items-center justify-center mx-auto text-forest">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-forest">Your Slot is Securely Booked!</h3>
                <p className="text-xs sm:text-sm text-ink-soft max-w-md mx-auto">
                  Your private appointment has been locked on the therapist's calendar. No payment credentials or identifiable metadata were linked to this session.
                </p>
              </div>

              {/* Secret Reference Token */}
              <div className="bg-cream border border-hairline rounded-sub p-6 max-w-sm mx-auto space-y-3">
                <span className="block text-[11px] font-sans font-bold text-moss tracking-wider uppercase">
                  Anonymous Reference Code
                </span>
                <span className="block font-mono text-xl sm:text-2xl font-bold text-forest tracking-wider select-all" id="booking-ref-code">
                  {referenceCode}
                </span>
                <p className="text-[10px] text-ink-faint">
                  Please copy and write down this secret code. It is your only ticket to enter the session waiting room at{' '}
                  <span className="font-semibold">
                    {selectedSlot ? formatTimeRange(selectedSlot.startTime, selectedSlot.endTime) : ''}
                  </span>
                  .
                </p>
              </div>

              <div className="bg-[#F4E2DD] border border-clay/20 rounded-sub p-3.5 max-w-md mx-auto text-left flex items-start space-x-3">
                <span className="text-clay font-bold text-sm mt-0.5">✦</span>
                <p className="text-[11px] text-clay font-medium leading-relaxed">
                  Remember: Hitha will never email or text you this link because we do not collect your contact details. Keep this tab open or write down your Reference Code.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="bg-forest hover:bg-forest/90 text-white font-sans font-semibold text-sm px-8 py-3 rounded-full shadow-resting transition-all"
                  id="finish-booking-btn"
                >
                  Close & Back to Directory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
