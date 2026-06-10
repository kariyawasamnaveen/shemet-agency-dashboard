'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, writeBatch, updateDoc } from 'firebase/firestore';

export default function ApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null); // For Modal

    // Fetch Pending Applications
    const fetchApplications = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "host_applications"),
                where("status", "==", "pending")
            );

            const querySnapshot = await getDocs(q);
            const appsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setApplications(appsList);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // Handle Approval
    const handleApprove = async (app) => {
        if (!confirm(`Are you sure you want to approve ${app.userName}?`)) return;

        try {
            const batch = writeBatch(db);

            // 1. Update Application Status
            const appRef = doc(db, "host_applications", app.id);
            batch.update(appRef, {
                status: 'approved',
                reviewedAt: new Date(),
                reviewedBy: 'Agency Admin'
            });

            // 2. Update User to be a Host
            const userRef = doc(db, "users", app.userId);
            batch.update(userRef, {
                isHost: true,
                hostSince: new Date()
            });

            await batch.commit();

            // UI Update
            setApplications(prev => prev.filter(item => item.id !== app.id));
            setSelectedApp(null);
            alert(`${app.userName} has been approved as a Host!`);

        } catch (error) {
            console.error("Error approving host:", error);
            alert("Failed to approve. Please try again.");
        }
    };

    // Handle Rejection
    const handleReject = async (app) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            const appRef = doc(db, "host_applications", app.id);
            await updateDoc(appRef, {
                status: 'rejected',
                rejectionReason: reason,
                reviewedAt: new Date()
            });

            setApplications(prev => prev.filter(item => item.id !== app.id));
            setSelectedApp(null);
        } catch (error) {
            console.error("Error rejecting:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Pending Applications
                    </h1>
                    <p className="text-slate-400 mt-1">Review and approve new talent requests.</p>
                </div>
                <button
                    onClick={fetchApplications}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                    🔄 Refresh
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="h-64 bg-slate-900/50 rounded-2xl animate-pulse"></div>
                    <div className="h-64 bg-slate-900/50 rounded-2xl animate-pulse"></div>
                </div>
            ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 text-center">
                    <div className="text-4xl mb-4">✨</div>
                    <h3 className="text-xl font-semibold text-white">All Caught Up!</h3>
                    <p className="text-slate-500 max-w-sm mt-2">There are no pending applications at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {applications.map((app) => (
                        <div key={app.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-pink-500/30 transition-all group">
                            {/* Candidate Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden">
                                        {/* If they have a profile photo in app or social we could show it, else placeholder */}
                                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-pink-400 transition-colors">{app.userName}</h3>
                                        <p className="text-xs text-slate-500">{app.category || 'General Talent'}</p>
                                    </div>
                                </div>
                                <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-500/20 uppercase">
                                    Pending
                                </span>
                            </div>

                            {/* Quick Info */}
                            <div className="space-y-2 text-sm text-slate-400 bg-slate-950/50 p-3 rounded-xl mb-4">
                                <div className="flex justify-between">
                                    <span>Age:</span> <span className="text-white">{app.age || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Email:</span> <span className="text-white">{app.email}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedApp(app)}
                                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/5"
                            >
                                Review Application
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Information Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedApp(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left: Photos & Verification */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white mb-4">Verification Documents</h2>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-400">ID Document</p>
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-700">
                                        {selectedApp.idDocumentUrl ? (
                                            <img src={selectedApp.idDocumentUrl} alt="ID" className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-slate-400">Verification Photos</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedApp.verificationPhotos?.map((photo, i) => (
                                            <div key={i} className="aspect-square bg-black rounded-xl overflow-hidden border border-slate-700">
                                                <img src={photo} alt={`Verify ${i}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Details & Actions */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedApp.userName}</h2>
                                    <p className="text-pink-500 font-medium">{selectedApp.category} Host</p>
                                </div>

                                <div className="space-y-4 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Bio / Reason</label>
                                        <p className="text-slate-300 mt-1">{selectedApp.reason || selectedApp.bio || "No reason provided."}</p>
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-bold">Social Links</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedApp.socialLinks?.length > 0 ? (
                                                selectedApp.socialLinks.map((link, i) => (
                                                    <a key={i} href={link} target="_blank" className="text-blue-400 text-sm hover:underline truncate max-w-full block">
                                                        {link}
                                                    </a>
                                                ))
                                            ) : (
                                                <p className="text-slate-500 italic text-sm">No links provided</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleReject(selectedApp)}
                                        className="py-4 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold transition-all"
                                    >
                                        Reject Application
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedApp)}
                                        className="py-4 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 text-white font-bold hover:shadow-lg hover:shadow-pink-500/20 transform hover:-translate-y-1 transition-all"
                                    >
                                        Approve Host
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
