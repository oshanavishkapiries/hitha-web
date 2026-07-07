import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Shield, Trash2, Video, Volume2, MessageSquare, AlertCircle } from 'lucide-react';
import { Appointment } from '../types';

interface MyAppointmentsModalProps {
  onClose: () => void;
}

export default function MyAppointmentsModal({ onClose }: MyAppointmentsModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadAppointments = () => {
    try {
      const existing = localStorage.getItem('hitha_appointments');
      if (existing) {
        setAppointments(JSON.parse(existing));
      }
    } catch (err) {
      console.error('Failed to parse appointments:', err);
    }
  };

  useEffect(() => {
    loadAppointments();
    
    const handleUpdate = () => {
      loadAppointments();
    };

    window.addEventListener('hitha_appointments_updated', handleUpdate);
    return () => window.removeEventListener('hitha_appointments_updated', handleUpdate);
  }, []);

  const handleCancelAppointment = (id: string) => {
    const updated = appointments.filter((apt) => apt.id !== id);
    setAppointments(updated);
    try {
      localStorage.setItem('hitha_appointments', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save updated list:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-card w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col shadow-elevated border border-hairline">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-hairline bg-cream/40">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-forest" />
            <span className="font-display font-semibold text-base text-forest">My Anonymous Appointments</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-cream text-ink-soft hover:text-ink transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-sprout/20 border border-sprout/40 rounded-sub p-3.5 text-xs text-forest leading-relaxed">
            <p className="font-semibold">Privacy Protection Active:</p>
            <p className="text-ink-soft mt-0.5">
              These sessions are stored strictly inside your local browser storage. Hitha servers do not keep persistent track of your IP address or session lists.
            </p>
          </div>

          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="border border-hairline bg-cream/20 rounded-sub p-4 space-y-4 relative">
                  
                  {/* Doctor Info Header */}
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={apt.doctorPicture}
                      alt={apt.doctorName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-sprout"
                    />
                    <div>
                      <h4 className="font-display font-semibold text-sm text-forest">{apt.doctorName}</h4>
                    </div>

                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-clay-tint text-ink-soft hover:text-clay transition-all cursor-pointer"
                      title="Cancel Appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date, Time and Mode info */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-sub border border-hairline">
                    <div className="space-y-1">
                      <span className="text-[10px] font-sans font-semibold text-ink-faint block uppercase">Date & Time</span>
                      <div className="flex items-center space-x-1.5 text-ink-soft">
                        <Calendar className="w-3.5 h-3.5 text-moss shrink-0" />
                        <span className="font-mono text-[11px]">{apt.timeRange}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-sans font-semibold text-ink-faint block uppercase">Consultation Mode</span>
                      <div className="flex items-center space-x-1.5 text-ink-soft capitalize">
                        {apt.contactMethod === 'video' && <Video className="w-3.5 h-3.5 text-moss shrink-0" />}
                        {apt.contactMethod === 'audio' && <Volume2 className="w-3.5 h-3.5 text-moss shrink-0" />}
                        {apt.contactMethod === 'chat' && <MessageSquare className="w-3.5 h-3.5 text-moss shrink-0" />}
                        <span>{apt.contactMethod} session</span>
                      </div>
                    </div>
                  </div>

                  {/* Ref Code & Alias Block */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-dashed border-hairline">
                    <div className="text-xs">
                      <span className="text-ink-faint">Your Alias: </span>
                      <span className="font-mono font-bold text-forest">{apt.nickname}</span>
                    </div>

                    <div className="bg-sprout/30 border border-sprout/60 px-3 py-1.5 rounded-full flex items-center space-x-2">
                      <span className="text-[10px] text-forest font-semibold uppercase tracking-wider">Ref Code:</span>
                      <span className="font-mono font-bold text-forest text-xs select-all">{apt.referenceCode}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-10 h-10 text-ink-faint mx-auto" />
              <p className="text-sm font-display font-medium text-ink-soft">No Booked Appointments Found</p>
              <p className="text-xs text-ink-faint max-w-xs mx-auto">
                Any future telehealth slots you secure will be securely logged right here in your browser.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-hairline bg-cream/20 text-center">
          <p className="text-[10px] text-ink-faint">
            Hitha complies with SLMC telemedicine privacy regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
