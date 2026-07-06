"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  User, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  LogOut, 
  Activity, 
  Video, 
  Check, 
  Send,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  useDoctorSummary,
  useDoctorProfile,
  useUpdateDoctorStatus,
} from '../../../lib/service/query/useDoctor';

// Mock Patient Chats
const initialChats = [
  { id: 1, name: "Thilina Perera", lastMsg: "Hello doctor, the sleeping tablets are working well.", time: "10:15 AM", unread: true },
  { id: 2, name: "Sanduni Alwis", lastMsg: "Should I continue my therapy sessions weekly?", time: "Yesterday", unread: false }
];

export default function DoctorDashboard() {
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'chat' | 'prescription' | 'profile'>('overview');
  const [chatList, setChatList] = useState(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(1);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<number, Array<{ sender: 'doctor' | 'patient', text: string, time: string }>>>({
    1: [
      { sender: 'patient', text: "Hello doctor, the sleeping tablets are working well. I feel much less anxious before bed.", time: "10:15 AM" },
      { sender: 'doctor', text: "That is fantastic to hear, Thilina. Ensure you continue the relaxation exercises we practiced.", time: "10:20 AM" }
    ],
    2: [
      { sender: 'patient', text: "Should I continue my therapy sessions weekly?", time: "Yesterday" }
    ]
  });

  // React Query server integrations
  const { data: realSummary, isLoading: isSummaryLoading } = useDoctorSummary();
  const { data: realProfile, isLoading: isProfileLoading } = useDoctorProfile();
  const updateStatusMutation = useUpdateDoctorStatus();

  // Automatically enable server database mode if doctor summary data is successfully retrieved
  useEffect(() => {
    if (realSummary) {
      setIsActive(realSummary.status === "ONLINE");
    }
  }, [realSummary]);

  // Toggle active accepting status
  const handleToggleActive = async () => {
    const nextState = !isActive;
    setIsActive(nextState);
    try {
      await updateStatusMutation.mutateAsync(nextState ? "ONLINE" : "OFFLINE");
    } catch (err: any) {
      alert(`API Error: ${err.message || 'Failed to update status on server.'}`);
    }
  };

  // Prescription State
  const [patientName, setPatientName] = useState('Thilina Perera');
  const [diagnosis, setDiagnosis] = useState('Mild Insomnia related to general work-stress');
  const [medications, setMedications] = useState('Melatonin 3mg - 1 capsule daily before bedtime (30 Days)');
  const [prescriptionList, setPrescriptionList] = useState<Array<{id: number, patient: string, dx: string, rx: string, date: string}>>([
    { id: 1, patient: "Nimal Fernando", dx: "Mild Anxiety", rx: "L-Theanine 200mg - 1 capsule twice daily", date: "2026-07-02" }
  ]);

  // Handle send message
  const handleSendMessage = () => {
    if (!currentMessage.trim() || selectedChatId === null) return;
    const time = "Just Now";
    const newMsg = { sender: 'doctor' as const, text: currentMessage, time };
    
    setChatHistory(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
    }));
    
    // Update last message in chat list
    setChatList(prev => prev.map(c => c.id === selectedChatId ? { ...c, lastMsg: currentMessage, time: "Just Now", unread: false } : c));
    setCurrentMessage('');

    // Simulate patient automated reply
    setTimeout(() => {
      const replies: Record<number, string> = {
        1: "Understood, thank you very much doctor. I will report back in two weeks.",
        2: "Perfect, I will schedule my next appointment through the Hitha portal!"
      };
      const replyText = replies[selectedChatId] || "Thank you doctor.";
      setChatHistory(prev => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), { sender: 'patient', text: replyText, time: "Just Now" }]
      }));
      setChatList(prev => prev.map(c => c.id === selectedChatId ? { ...c, lastMsg: replyText, time: "Just Now" } : c));
    }, 1500);
  };

  // Add Prescription
  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const newRx = {
      id: Date.now(),
      patient: patientName,
      dx: diagnosis,
      rx: medications,
      date: new Date().toISOString().split('T')[0]
    };
    setPrescriptionList(prev => [newRx, ...prev]);
    setDiagnosis('');
    setMedications('');
    alert("SLMC Compliant Prescription generated and saved successfully!");
    setActiveTab('overview');
  };

  // Extract displaying metadata
  const docName = realSummary
    ? `Dr. ${realSummary.firstName} ${realSummary.lastName}`
    : "Dr. Kaveesh Alwis";

  const docSlmc = realSummary
    ? realSummary.slmcLicenseNumber || "9321"
    : "9321";

  const docCategory = realSummary && realSummary.category
    ? realSummary.category.replace(/_/g, " ")
    : "Clinical Psychologist";

  const docFee = realSummary
    ? `${realSummary.hourlyRate || "3,500"}`
    : "3,500";

  return (
    <AppShell>
      <div className="bg-cream min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#142B22] to-[#1E4B3A] text-white p-6 sm:p-8 rounded-3xl shadow-resting flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8FCB84] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <div className="flex items-center space-x-2">
                <span className="bg-mint/20 text-mint text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  SLMC No: {docSlmc}
                </span>
                <span className="bg-[#FAF9F5]/10 text-sprout text-xs px-2.5 py-1 rounded-full font-mono">
                  {docCategory}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold">
                Ayubowan, {docName}
              </h1>
              <p className="text-xs text-sprout/80 max-w-xl">
                Trilingual clinical psychologist counseling sanctuary. Thank you for making Sri Lanka's mindsets healthier and anonymous.
              </p>
            </div>

            {/* Quick Availability Switch & Logout */}
            <div className="flex flex-wrap items-center gap-4 relative z-10 w-full sm:w-auto">
              <div className="bg-[#0B1E17] border border-[#2B4E41] px-4 py-2.5 rounded-2xl flex items-center space-x-3 text-sm">
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
                className="bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 p-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 text-xs"
                id="doctor-logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Simple Dashboard Cards (Click to Open Mockup Views) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Appointments Card */}
            <button
              onClick={() => setActiveTab(activeTab === 'appointments' ? 'overview' : 'appointments')}
              className={`p-6 rounded-2xl text-left border transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-mint/10 border-mint shadow-md ring-1 ring-mint'
                  : 'bg-white border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated'
              }`}
              id="doc-card-appointments"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-mint/10 rounded-xl text-forest">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-forest bg-mint/20 px-2 py-0.5 rounded-full">
                  4 Today
                </span>
              </div>
              <h3 className="font-display font-bold text-forest text-base mb-1">Appointments</h3>
              <p className="text-xs text-ink-soft">
                View scheduled clients, join anonymous video calls, or update logs.
              </p>
            </button>

            {/* Patients Messages Card */}
            <button
              onClick={() => setActiveTab(activeTab === 'chat' ? 'overview' : 'chat')}
              className={`p-6 rounded-2xl text-left border transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-mint/10 border-mint shadow-md ring-1 ring-mint'
                  : 'bg-white border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated'
              }`}
              id="doc-card-chat"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  1 Unread
                </span>
              </div>
              <h3 className="font-display font-bold text-forest text-base mb-1">Encrypted Messages</h3>
              <p className="text-xs text-ink-soft">
                Secure trilingual text counseling without exposing credentials.
              </p>
            </button>

            {/* Prescriptions Card */}
            <button
              onClick={() => setActiveTab(activeTab === 'prescription' ? 'overview' : 'prescription')}
              className={`p-6 rounded-2xl text-left border transition-all cursor-pointer ${
                activeTab === 'prescription'
                  ? 'bg-mint/10 border-mint shadow-md ring-1 ring-mint'
                  : 'bg-white border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated'
              }`}
              id="doc-card-prescription"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  SLMC Print
                </span>
              </div>
              <h3 className="font-display font-bold text-forest text-base mb-1">Issue Prescription</h3>
              <p className="text-xs text-ink-soft">
                Draft digital prescriptions. Safe & compliant with Sri Lankan rules.
              </p>
            </button>

            {/* Profile Settings Card */}
            <button
              onClick={() => setActiveTab(activeTab === 'profile' ? 'overview' : 'profile')}
              className={`p-6 rounded-2xl text-left border transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-mint/10 border-mint shadow-md ring-1 ring-mint'
                  : 'bg-white border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated'
              }`}
              id="doc-card-profile"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Active Profile
                </span>
              </div>
              <h3 className="font-display font-bold text-forest text-base mb-1">Counseling Fees</h3>
              <p className="text-xs text-ink-soft">
                Set consultation prices, edit bio information, list languages spoken.
              </p>
            </button>

          </div>

          {/* Dynamic Content Views based on active option */}
          <div className="transition-all duration-300">

            {/* 1. DEFAULT OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats & Earnings Block */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-hairline shadow-resting">
                    <h2 className="text-lg font-display font-bold text-forest mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-mint" />
                      <span>Counseling Performance Metrics</span>
                    </h2>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-cream/40 p-4 rounded-2xl text-center">
                        <span className="text-xs text-ink-soft block mb-1">Satisfied Patients</span>
                        <span className="text-2xl font-display font-bold text-forest">99.1%</span>
                        <span className="text-[10px] text-mint block font-medium">★ 4.93 Star Rating</span>
                      </div>
                      <div className="bg-cream/40 p-4 rounded-2xl text-center">
                        <span className="text-xs text-ink-soft block mb-1">Completed Sessions</span>
                        <span className="text-2xl font-display font-bold text-forest">148</span>
                        <span className="text-[10px] text-[#C9DFC7] block font-mono">18 Pending Escrow</span>
                      </div>
                      <div className="bg-cream/40 p-4 rounded-2xl text-center">
                        <span className="text-xs text-ink-soft block mb-1">Total Payouts</span>
                        <span className="text-lg font-display font-bold text-forest">LKR 236,800</span>
                        <span className="text-[10px] text-emerald-600 block font-bold">Direct to Bank</span>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-hairline pt-4 flex justify-between items-center text-xs">
                      <span className="text-ink-soft">Next scheduled payout release: <strong className="text-forest">July 10, 2026</strong></span>
                      <button className="text-forest underline font-bold hover:text-mint transition-colors">View Statements</button>
                    </div>
                  </div>

                  {/* Quick Guidelines Card */}
                  <div className="bg-mint/10 p-6 rounded-3xl border border-mint/30 flex items-start space-x-4">
                    <Sparkles className="w-6 h-6 text-forest shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-display font-bold text-forest text-sm">Hitha Trilingual Quality Standard</h4>
                      <p className="text-xs text-forest/90 mt-1 leading-relaxed">
                        To maintain secure anonymity, never ask patients for their real names, addresses, or NIC numbers during text or audio consultations. Always respect their pseudonym profiles. Let us preserve safe mental wellness for Sri Lanka.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Queue Quick-look */}
                <div className="bg-white p-6 rounded-3xl border border-hairline shadow-resting space-y-4">
                  <div className="flex justify-between items-center border-b border-hairline pb-3">
                    <h3 className="font-display font-bold text-forest text-sm flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-mint" />
                      <span>Today's Sessions</span>
                    </h3>
                    <span className="text-[10px] bg-forest text-white px-2 py-0.5 rounded-full font-mono">2 Remaining</span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-cream/30 hover:bg-cream/70 rounded-xl flex justify-between items-center border border-hairline transition-colors">
                      <div>
                        <h4 className="text-xs font-bold text-forest">Thilina Perera (Anxious Client)</h4>
                        <span className="text-[10px] text-ink-soft block font-mono">11:00 AM - 11:45 AM (Sinhala)</span>
                      </div>
                      <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full">Next Up</span>
                    </div>

                    <div className="p-3 bg-cream/30 hover:bg-cream/70 rounded-xl flex justify-between items-center border border-hairline transition-colors">
                      <div>
                        <h4 className="text-xs font-bold text-forest">Sanduni Alwis (Stress Recovery)</h4>
                        <span className="text-[10px] text-ink-soft block font-mono">02:30 PM - 03:15 PM (English)</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full">Later</span>
                    </div>

                    <div className="p-3 bg-[#EAF2EC] rounded-xl flex justify-between items-center border border-[#8FCB84]/40">
                      <div>
                        <h4 className="text-xs font-bold text-forest text-forest/70 line-through">Nimal Fernando</h4>
                        <span className="text-[10px] text-ink-soft/60 block font-mono">09:00 AM - Completed</span>
                      </div>
                      <span className="text-[10px] bg-forest text-white font-bold p-1 rounded-full"><Check className="w-3 h-3" /></span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="w-full bg-cream hover:bg-cream-dark text-forest text-xs font-bold py-2.5 rounded-xl transition-all border border-hairline"
                  >
                    Manage Appointments Queue
                  </button>
                </div>
              </div>
            )}

            {/* 2. APPOINTMENTS PAGE MOCKUP */}
            {activeTab === 'appointments' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
                <div className="flex justify-between items-center border-b border-hairline pb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-forest">Appointment Schedule & Telehealth Room</h2>
                    <p className="text-xs text-ink-soft mt-1">Join high-fidelity trilingual telehealth sessions seamlessly from this panel.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="text-xs text-forest hover:underline font-bold"
                  >
                    Back to Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Appointments list */}
                  <div className="lg:col-span-1 space-y-3 border-r border-hairline pr-0 lg:pr-6">
                    <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-forest mb-4">Patient Queue</h3>
                    
                    <div className="p-4 bg-mint/10 border border-mint/40 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] bg-forest text-white px-2 py-0.5 rounded-full font-mono font-bold">11:00 AM (Active Now)</span>
                          <h4 className="font-display font-bold text-forest text-sm mt-1.5">Thilina Perera</h4>
                          <span className="text-xs text-ink-soft">Trilingual Counseling</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-soft">"Experiencing continuous insomnia due to work stressors."</p>
                      <button className="w-full bg-forest text-white hover:bg-forest/95 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-all">
                        <Video className="w-3.5 h-3.5" />
                        <span>Enter Secure Video Room</span>
                      </button>
                    </div>

                    <div className="p-4 bg-white border border-hairline hover:border-forest/30 rounded-2xl space-y-3 transition-colors">
                      <div>
                        <span className="text-[10px] bg-cream text-ink-soft border border-hairline px-2 py-0.5 rounded-full font-mono">02:30 PM (Upcoming)</span>
                        <h4 className="font-display font-bold text-forest text-sm mt-1.5">Sanduni Alwis</h4>
                        <span className="text-xs text-ink-soft">Anxiety Therapy</span>
                      </div>
                      <button className="w-full bg-cream hover:bg-cream-dark text-forest text-xs font-bold py-2 rounded-lg transition-colors">
                        View Patient Logs
                      </button>
                    </div>
                  </div>

                  {/* Live Room Mockup */}
                  <div className="lg:col-span-2 bg-[#0B1E17] rounded-2xl p-6 text-white flex flex-col justify-between min-h-[350px] relative overflow-hidden border border-mint/20">
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=600&auto=format&fit=crop')" }} />
                    
                    {/* Secure Badge */}
                    <div className="flex justify-between items-center relative z-10 w-full">
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-1" />
                        Secure Encrypted Consultation Room
                      </span>
                      <span className="text-xs text-sprout font-mono bg-[#142B22]/80 px-2 py-1 rounded-lg">Time Remaining: 42:10</span>
                    </div>

                    {/* Patient Video Placeholder */}
                    <div className="my-auto text-center relative z-10 py-12">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <Video className="w-8 h-8 text-mint" />
                      </div>
                      <h4 className="font-display font-bold text-lg text-mint">Patient (Anonymous Thilina)</h4>
                      <p className="text-xs text-sprout/70 max-w-sm mx-auto mt-1">
                        Anonymous audio/video call is standby. Click the active button on the left panel to join. No session logs are captured on server.
                      </p>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex justify-center items-center gap-4 relative z-10 pt-4 border-t border-white/10">
                      <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                        End Call
                      </button>
                      <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                        Mute Microphone
                      </button>
                      <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                        Disable Camera
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PATIENT MESSENGER MOCKUP */}
            {activeTab === 'chat' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
                <div className="flex justify-between items-center border-b border-hairline pb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-forest">Patient Messenger (End-to-End Encrypted)</h2>
                    <p className="text-xs text-ink-soft mt-1">Continuous asynchronous mental support portal. Direct encrypted communication.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="text-xs text-forest hover:underline font-bold"
                  >
                    Back to Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                  {/* Chat List */}
                  <div className="lg:col-span-1 border-r border-hairline pr-0 lg:pr-6 flex flex-col space-y-2 overflow-y-auto">
                    <span className="text-[10px] uppercase font-bold text-forest block mb-2 tracking-wider">Active Patient Inboxes</span>
                    {chatList.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                          selectedChatId === chat.id
                            ? 'bg-mint/15 border-mint font-medium'
                            : 'bg-[#FAF9F5]/40 border-hairline hover:bg-cream'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-forest">{chat.name}</span>
                          <span className="text-[10px] text-ink-soft/70 font-mono">{chat.time}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-ink-soft truncate flex-1">{chat.lastMsg}</p>
                          {chat.unread && (
                            <span className="w-2 h-2 rounded-full bg-mint shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Active Chat Thread */}
                  <div className="lg:col-span-2 flex flex-col justify-between h-full bg-cream/30 border border-hairline rounded-2xl p-4">
                    {selectedChatId !== null ? (
                      <>
                        {/* Thread Header */}
                        <div className="border-b border-hairline pb-2 mb-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-display font-bold text-forest text-sm">
                              {chatList.find(c => c.id === selectedChatId)?.name}
                            </h4>
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Encrypted Connection Active
                            </span>
                          </div>
                          <span className="text-xs text-ink-soft font-mono">Anonymous Patient Record</span>
                        </div>

                        {/* Message History */}
                        <div className="flex-1 overflow-y-auto space-y-3.5 p-2 mb-4 scrollbar-thin">
                          {chatHistory[selectedChatId]?.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                                msg.sender === 'doctor'
                                  ? 'bg-forest text-white ml-auto rounded-tr-none'
                                  : 'bg-white border border-hairline text-ink rounded-tl-none'
                              }`}
                            >
                              <p className="leading-relaxed">{msg.text}</p>
                              <span className={`block text-[9px] mt-1 text-right ${msg.sender === 'doctor' ? 'text-sprout/70' : 'text-ink-soft/70'}`}>
                                {msg.time}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Input Area */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendMessage();
                            }}
                            placeholder="Type safe, trilingual professional guidance..."
                            className="flex-1 bg-white border border-hairline rounded-xl px-4 py-2.5 text-xs outline-none focus:border-forest/50 transition-colors"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="bg-forest hover:bg-forest/90 text-white p-2.5 rounded-xl cursor-pointer transition-all"
                            id="doc-chat-send"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="my-auto text-center py-12">
                        <p className="text-xs text-ink-soft">Select an active patient chat thread from the left menu.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. PRESCRIPTION WRITER MOCKUP */}
            {activeTab === 'prescription' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
                <div className="flex justify-between items-center border-b border-hairline pb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-forest">Digital SLMC Prescriptions Generator</h2>
                    <p className="text-xs text-ink-soft mt-1">Issue secure prescription PDFs compliant with Ministry of Health & SLMC telemedicine mandates.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="text-xs text-forest hover:underline font-bold"
                  >
                    Back to Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form */}
                  <form onSubmit={handleSavePrescription} className="lg:col-span-2 space-y-4 bg-cream/10 border border-hairline p-5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-forest block tracking-wider mb-2">Draft Prescription Details</span>
                    
                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Select Patient</label>
                      <select 
                        value={patientName} 
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full bg-white border border-hairline rounded-xl p-2.5 text-xs outline-none focus:border-forest"
                      >
                        <option value="Thilina Perera">Thilina Perera</option>
                        <option value="Sanduni Alwis">Sanduni Alwis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Diagnosis / Indication</label>
                      <input
                        type="text"
                        required
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="e.g. Mild anxiety & sleeplessness secondary to work stress"
                        className="w-full bg-white border border-hairline rounded-xl p-2.5 text-xs outline-none focus:border-forest"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Medications & Dosage Instructions</label>
                      <textarea
                        rows={4}
                        required
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        placeholder="e.g. Melatonin 3mg - 1 pill daily 30 mins before sleep. Duration: 30 days."
                        className="w-full bg-white border border-hairline rounded-xl p-2.5 text-xs outline-none focus:border-forest font-mono leading-relaxed"
                      />
                    </div>

                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>By saving this form, you authorize adding {docName}'s verified SLMC seal and digital signature to the digital prescription document.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-forest text-white hover:bg-forest/90 font-bold text-xs py-3 rounded-xl transition-all shadow-resting"
                      id="save-rx-submit"
                    >
                      Sign & Issue Compliant SLMC Prescription
                    </button>
                  </form>

                  {/* History of prescriptions issued */}
                  <div className="lg:col-span-1 space-y-4">
                    <span className="text-[10px] uppercase font-bold text-forest block tracking-wider">Issued Prescriptions Log</span>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                      {prescriptionList.map(rx => (
                        <div key={rx.id} className="p-3.5 bg-white border border-hairline rounded-xl text-xs space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-ink-soft font-mono">
                            <span>{rx.date}</span>
                            <span className="text-forest font-bold">Issued</span>
                          </div>
                          <h4 className="font-bold text-forest">{rx.patient}</h4>
                          <p className="text-[11px] text-ink-soft"><strong className="text-forest">Dx:</strong> {rx.dx}</p>
                          <p className="text-[11px] font-mono text-sprout bg-forest px-2 py-1 rounded mt-1.5">{rx.rx}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PROFILE SETTINGS MOCKUP */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
                <div className="flex justify-between items-center border-b border-hairline pb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-forest">Sanctuary Profile & Consulting Rates</h2>
                    <p className="text-xs text-ink-soft mt-1">Configure how patient directories display your trilingual verified counselor card.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="text-xs text-forest hover:underline font-bold"
                  >
                    Back to Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-[#FAF9F5] border border-hairline rounded-2xl text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-mint/30 mx-auto flex items-center justify-center font-display font-bold text-forest text-lg border border-mint">
                      {docName.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-forest text-sm">{docName}</h4>
                      <p className="text-[11px] text-ink-soft">{docCategory} • SLMC-{docSlmc}</p>
                    </div>
                    <span className="text-[10px] bg-mint/20 text-forest px-2 py-0.5 rounded-full font-bold inline-block">Trilingual (Sinhala, Tamil, English)</span>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-ink-soft mb-1">Hourly Consultation Fee (LKR)</label>
                        <input
                          type="text"
                          defaultValue={docFee}
                          className="w-full bg-cream border border-hairline rounded-xl p-2.5 text-xs text-forest outline-none focus:border-forest"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-soft mb-1">Hospital Surcharge / Escrow Split</label>
                        <input
                          type="text"
                          disabled
                          value="0% (Hitha Directory is free of commission)"
                          className="w-full bg-gray-100 border border-hairline rounded-xl p-2.5 text-xs text-gray-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-soft mb-1">Doctor Bio Card</label>
                      <textarea
                        rows={3}
                        defaultValue="Over 8+ years of dedicated trilingual counseling expertise focused on stress reduction, corporate burnouts, and family mediation. Strictly private telemedicine specialist."
                        className="w-full bg-cream border border-hairline rounded-xl p-2.5 text-xs text-forest outline-none focus:border-forest leading-relaxed"
                      />
                    </div>

                    <button 
                      onClick={() => {
                        alert("Settings updated successfully!");
                        setActiveTab('overview');
                      }}
                      className="bg-forest text-white hover:bg-forest/90 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      Save Profile Adjustments
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </AppShell>
  );
}
