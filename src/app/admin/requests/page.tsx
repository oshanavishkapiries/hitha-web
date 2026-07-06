"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppShell from '../../../components/AppShell';
import { navigateTo } from '../../../utils/navigation';
import { IconArrowLeft, IconCheck, IconX, IconStethoscope, IconAlertTriangle } from '@tabler/icons-react';
import { useDoctorDetails, useApproveDoctor, useRejectDoctor } from '../../../lib/service/query/useAdmin';
import { useNotificationStore } from '../../../lib/store/notificationStore';
import { useAlert } from '../../../context/AlertContext';
import { getApiErrorMessage } from '../../../utils/errors';
import DoctorDetailCard from '../../../components/DoctorDetailCard';

function ViewDoctorRequestContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { showAlert } = useAlert();
  const { data: doctor, isLoading, isError } = useDoctorDetails(id);
  const approveMutation = useApproveDoctor();
  const rejectMutation = useRejectDoctor();
  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isPending = doctor?.status === 'PENDING_APPROVAL' || doctor?.status === 'PENDING_VERIFICATION';

  const handleApprove = async () => {
    if (!id) return;
    try {
      await approveMutation.mutateAsync(id);
      showAlert('Successfully approved doctor profile on secure server.', 'success');
      fetchNotifications();
      navigateTo('/admin/dashboard');
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to approve doctor status.')}`, 'error');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectReason.trim()) {
      showAlert('Rejection reason is required.', 'warning');
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id, reason: rejectReason });
      showAlert('Successfully rejected doctor profile.', 'success');
      fetchNotifications();
      navigateTo('/admin/dashboard');
    } catch (err: any) {
      showAlert(`API Error: ${getApiErrorMessage(err, 'Failed to reject doctor profile.')}`, 'error');
    }
  };

  return (
    <AppShell>
      <div className="bg-[#FAF9F5] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => navigateTo('/admin/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-forest transition-colors cursor-pointer"
            id="view-request-back"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-hairline shadow-resting space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-hairline">
              <h1 className="text-xl font-display font-bold text-forest flex items-center gap-2">
                <IconStethoscope className="w-5 h-5 text-mint" />
                <span>{isPending ? 'Doctor Registration Request' : 'Doctor Profile'}</span>
              </h1>
              {id && <span className="text-[10px] font-mono text-ink-soft">ID: {id}</span>}
            </div>

            {!id && (
              <div className="py-10 text-center text-xs text-red-600 font-semibold">No doctor ID was provided in the URL.</div>
            )}

            {id && isLoading && (
              <div className="py-10 text-center text-xs text-ink-soft font-semibold">Loading doctor details...</div>
            )}

            {id && isError && !isLoading && (
              <div className="py-10 text-center text-xs text-red-600 font-semibold">Failed to load doctor request details.</div>
            )}

            {id && !isLoading && !isError && doctor && (
              <>
                <DoctorDetailCard doctor={doctor} />

                {isPending && (
                  <div className="pt-4 border-t border-hairline">
                    {isRejecting ? (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-3">
                        <label className="block text-[10px] font-bold text-red-800 uppercase tracking-wider">
                          Reason for Rejection (Required)
                        </label>
                        <textarea
                          placeholder="e.g. SLMC number mismatch or documents unreadable."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows={3}
                          className="w-full text-xs p-2.5 border border-red-200 rounded-xl outline-none focus:border-red-400 bg-white text-[#0B1E17]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setIsRejecting(false); setRejectReason(''); }}
                            className="px-4 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={rejectMutation.isPending}
                            className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50 cursor-pointer"
                          >
                            {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsRejecting(true)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <IconX className="w-3.5 h-3.5" />
                          Reject Request
                        </button>
                        <button
                          onClick={handleApprove}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="px-4 py-2.5 bg-mint/20 hover:bg-mint/40 text-forest rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <IconCheck className="w-3.5 h-3.5" />
                          {approveMutation.isPending ? 'Approving...' : 'Approve & Activate'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!isPending && (
                  <div className="pt-4 border-t border-hairline flex items-center gap-2 text-xs text-ink-soft">
                    <IconAlertTriangle className="w-4 h-4 text-mint shrink-0" />
                    <span>This application has already been processed. Manage active status from the Doctor Registry.</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ViewDoctorRequestPage() {
  return (
    <Suspense fallback={null}>
      <ViewDoctorRequestContent />
    </Suspense>
  );
}
