'use client';
import { useState, useEffect, useRef } from 'react';
import { auth, db, app } from '@/lib/firebase';
import { 
    RecaptchaVerifier,
    signInWithPhoneNumber, 
    EmailAuthProvider,
    linkWithCredential,
    getAuth
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    setDoc,
    runTransaction,
    serverTimestamp 
} from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, Component } from 'react';
import { getSyntheticEmail } from '@/lib/auth-util';
import ShemetLoader from '../components/ShemetLoader';
import { COUNTRIES } from '@/lib/constants/countries';

// Simple Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#fff', color: '#e11d48', minHeight: '100vh', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900' }}>System Exception</h2>
          <pre style={{ margin: '20px 0', opacity: 0.7 }}>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', borderRadius: '12px', background: '#3a2639', color: '#fff', border: 'none', fontWeight: '800' }}>Reload System</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RegisterForm() {
    const [step, setStep] = useState(1); // 1: Nickname, 2: Phone, 3: OTP, 4: Password
    const [nickname, setNickname] = useState('');
    const [countryCode, setCountryCode] = useState('+94');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [agencyName, setAgencyName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [customId, setCustomId] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const recaptchaContainerRef = useRef(null);
    const recaptchaVerifierRef = useRef(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const [parentAgencyId, setParentAgencyId] = useState(null);

    const brandPlum = '#3a2639';
    const brandPink = '#ff1493';

    useEffect(() => {
        const urlId = searchParams.get('agencyId');
        const localId = localStorage.getItem('shemet_referral_agencyId');
        setParentAgencyId(urlId || localId);
        setPageLoading(false);
    }, [searchParams]);

    const initRecaptcha = () => {
        if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
            try {
                // Get the auth instance explicitly from the app instance for consistency
                const authInstance = getAuth(app);
                
                // Safety guard: Ensure auth instance is available
                if (!authInstance) {
                    throw new Error("Auth instance not found");
                }

                // LEGACY FIX: Ensure auth.settings exists to avoid the 'appVerificationDisabledForTesting' error
                // This is a known issue with some React 19/Firebase bundling scenarios
                if (!authInstance.settings) {
                    console.warn("Auth settings not found, initializing fallback...");
                    try {
                        // Attempt to inject basic settings if the build tool stripped them
                        authInstance.settings = { appVerificationDisabledForTesting: false };
                    } catch (e) {
                        console.error("Failed to inject auth settings fallback", e);
                    }
                }

                recaptchaVerifierRef.current = new RecaptchaVerifier(authInstance, recaptchaContainerRef.current, {
                    'size': 'invisible',
                    'callback': (response) => { console.log("Recaptcha ready"); }
                });
            } catch (err) {
                console.error("Recaptcha Error", err);
                setError('Security system failed to start: ' + err.message + '. Please refresh.');
            }
        }
        return recaptchaVerifierRef.current;
    };

    useEffect(() => {
        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };
    }, []);

    const validateNickname = async (e) => {
        e.preventDefault();
        if (nickname.length < 3) {
            setError('Nickname too short (min 3 chars).');
            return;
        }
        setError('');
        setLoading(true);

        try {
            // Check nickname
            const qNick = query(collection(db, "users"), where("name", "==", nickname));
            const snapNick = await getDocs(qNick);
            if (!snapNick.empty) {
                setError('Nickname already taken.');
                setLoading(false);
                return;
            }

            // Check Custom Numeric ID
            if (!/^\d{8,12}$/.test(customId)) {
                setError('Agent ID must be 8-12 digits.');
                setLoading(false);
                return;
            }

            const qId = query(collection(db, "users"), where("id", "==", customId));
            const snapId = await getDocs(qId);
            if (!snapId.empty) {
                setError('This Agent ID is already registered.');
                setLoading(false);
                return;
            }

            setStep(2);
        } catch (err) {
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const appVerifier = initRecaptcha();
        if (!appVerifier) {
            setError('System error: Failed to initialize security check. Please refresh.');
            setLoading(false);
            return;
        }

        try {
            const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
            const q = query(collection(db, "users"), where("phoneNumber", "==", fullPhone));
            const snap = await getDocs(q);
            
            if (!snap.empty && snap.docs[0].data().isAgent) {
                setError('Number already registered as Agency.');
                setLoading(false);
                return;
            }

            const result = await signInWithPhoneNumber(getAuth(app), fullPhone, appVerifier);
            setConfirmationResult(result);
            setStep(3);
        } catch (err) {
            console.error("OTP Error:", err);
            setError('Failed to send SMS. Refresh & retry.');
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length < 6) { setError('Enter 6-digit code.'); return; }
        setStep(4);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (password.length < 6) { setError('Min 6 characters required.'); return; }

        setError('');
        setLoading(true);

        try {
            const cleanedPhone = phone.replace(/\D/g, '');
            const fullPhone = `${countryCode}${cleanedPhone}`;
            const syntheticEmail = getSyntheticEmail(fullPhone);
            const trimmedPassword = password.trim();

            console.log("!!! FLOW DEBUG !!! [REG] Values:", { fullPhone, syntheticEmail, trimmedPassword });

            const userCredential = await confirmationResult.confirm(otp);
            const user = userCredential.user;
            console.log("!!! FLOW DEBUG !!! [REG] OTP Confirmation SUCCESS. UID:", user.uid);

            try {
                const credential = EmailAuthProvider.credential(syntheticEmail, trimmedPassword);
                console.log("!!! FLOW DEBUG !!! [REG] Linking Credential Started...");
                await linkWithCredential(user, credential);
                console.log("!!! FLOW DEBUG !!! [REG] LINKING SUCCESS! Linked email:", user.email);
            } catch (authUpdateErr) {
                console.error("!!! FLOW DEBUG !!! [REG] LINKING FAILED !!! CODE:", authUpdateErr.code, "MESSAGE:", authUpdateErr.message);
                console.error("!!! FLOW DEBUG !!! [REG] Full Error Object:", authUpdateErr);
                
                if (authUpdateErr.code === 'auth/credential-already-in-use') {
                    setError('This phone/email is already linked to another account.');
                } else if (authUpdateErr.code === 'auth/weak-password') {
                    setError('Password is too weak. Please use a stronger password.');
                } else {
                    setError(`Security Error: Could not set password (${authUpdateErr.code}). Please try again.`);
                }
                setLoading(false);
                return;
            }

            const finalNumericId = customId; // Use the seller-defined ID
            
            const finalAgencyId = `SH${finalNumericId.toString().slice(-4)}`;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            const agencyData = {
                uid: user.uid,
                id: finalNumericId.toString(),
                name: nickname,
                phoneNumber: fullPhone,
                isAgent: true,
                agencyId: finalAgencyId,
                agencyName: agencyName || `${nickname}'s Agency`,
                parentAgencyId: parentAgencyId || null,
                registeredAt: new Date().toISOString(),
                createdAt: userSnap.exists() ? userSnap.data().createdAt : serverTimestamp(),
                updatedAt: new Date().toISOString(),
                isVerified: false,
                isLive: false,
                level: 1,
                diamonds: 0,
                gender: 'Male',
                profileComplete: true,
                isOnline: false,
                lastSeen: new Date().toISOString()
            };

            await setDoc(userRef, agencyData, { merge: true });
            router.push('/');

        } catch (err) {
            console.error("Registration Error:", err);
            setError('Failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <ShemetLoader />;

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '24px',
            overflow: 'hidden',
        }}>
            {loading && <ShemetLoader />}
            
            {/* Hidden Recaptcha Anchor */}
            <div ref={recaptchaContainerRef}></div>

            {/* Background elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255, 20, 147, 0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(58, 38, 57, 0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

            <div style={{
                zIndex: 1,
                width: '100%',
                maxWidth: 440,
                background: 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: 32,
                padding: '48px 40px',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 25px 50px -12px rgba(58, 38, 57, 0.12)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: brandPlum, letterSpacing: '-0.02em', margin: 0 }}>Create Agency</h1>
                    <p style={{ fontSize: 14, color: '#64748b', marginTop: 10, fontWeight: 600 }}>
                        {step === 1 && 'Step 1: Choose Identity'}
                        {step === 2 && 'Step 2: Mobile Binding'}
                        {step === 3 && 'Step 3: Verification'}
                        {step === 4 && 'Step 4: Ultimate Security'}
                    </p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', color: '#e11d48', fontSize: 13, padding: '12px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(225, 29, 72, 0.1)', fontWeight: 700, marginBottom: 20 }}>
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={validateNickname} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Agent Nickname</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                                placeholder="e.g. UniquePartner123"
                                required
                                style={{ width: '100%', padding: '13px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: 15, fontWeight: 600, outline: 'none', color: brandPlum }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Unique Agent ID (8-12 Digits)</label>
                            <input
                                type="text"
                                value={customId}
                                onChange={(e) => setCustomId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                placeholder="e.g. 88776655"
                                required
                                style={{ width: '100%', padding: '13px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: 15, fontWeight: 600, outline: 'none', color: brandPlum }}
                            />
                        </div>
                        <button type="submit" style={{ width: '100%', background: brandPlum, color: '#fff', border: 'none', borderRadius: '16px', padding: '16px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(58, 38, 57, 0.2)' }}>
                            Next Stage
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Mobile Number</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    style={{ padding: '13px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: 14, fontWeight: 800, color: brandPlum, cursor: 'pointer', appearance: 'none', textAlign: 'center', width: 95 }}
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.name} value={c.code}>
                                            {c.flag} {c.code}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="77XXXXXXX"
                                    required
                                    style={{ flex: 1, padding: '13px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: 15, fontWeight: 600, outline: 'none', color: brandPlum }}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', background: brandPlum, color: '#fff', border: 'none', borderRadius: '16px', padding: '16px', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Processing...' : 'Link Mobile Number'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Auth Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                required
                                style={{ width: '100%', padding: '13px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: 24, fontWeight: 800, textAlign: 'center', letterSpacing: '8px', color: brandPink }}
                            />
                        </div>
                        <button type="submit" style={{ width: '100%', background: brandPlum, color: '#fff', border: 'none', borderRadius: '16px', padding: '16px', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
                            Verify Identity
                        </button>
                    </form>
                )}

                {step === 4 && (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Brand Entity Name</label>
                            <input
                                type="text"
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                placeholder="e.g. My Global Agency"
                                style={{ width: '100%', padding: '13px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: 15, fontWeight: 600, color: brandPlum }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Access Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: '100%', padding: '13px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: 15, color: brandPlum }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Confirm Access</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ width: '100%', padding: '13px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: 15, color: brandPlum }}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', background: brandPlum, border: 'none', color: '#fff', borderRadius: '16px', padding: '16px', fontSize: 18, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 10 }}>
                            {loading ? 'Finalizing Setup...' : 'Launch Agency Now'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                        Existing Member?{' '}
                        <Link href="/login" style={{ color: brandPink, fontWeight: 800, textDecoration: 'none' }}>Access Portal</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<ShemetLoader />}>
                <RegisterForm />
            </Suspense>
        </ErrorBoundary>
    );
}

