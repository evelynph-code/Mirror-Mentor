import { useState } from "react";
import {supabase} from "../services/supabase"
import { useWindowSize } from "../hooks/useWindowSize";


function Auth({onAuthSuccess}) {
    const {width} = useWindowSize()
    const isMobile = width < 768

    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)

    async function handleSubmit() {
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            if (mode === 'signup') {
                const {data, error} = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {full_name: name}
                    }
                })
                if (error) throw error
                setMessage('Account created! Please check your email to verify.')
            } else {
                const {data, error} = await supabase.auth.signInWithPassword({
                    email, 
                    password,
                })
                if (error) throw error
                if (onAuthSuccess) onAuthSuccess(data.user)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    //Allow pressing enter to submit
    function handleKeyDown(e) {
        if (e.key === 'Enter') handleSubmit()
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#fff0f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: isMobile ? '28px 20px' : '40px 36px',
                border: '1px solid #f0d9e6',
                boxShadow: '0 4px 24px rgba(180, 100, 140, 0.08)',
            }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px'}}>
                    <img
                    src="/Logo.png"
                    alt="Mirror Mentor"
                    style={{
                        width: '72px', height: '72px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '12px',
                        border: '2px solid #f0d9e6',
                    }} />
                    
                    <h1 style={{fontSize: '22px', fontWeight: '500', color: '#6b3050'}}>
                        Mirror Mentor
                    </h1>
                    <p style={{fontSize: '13px', color: '#c4a0b4', marginTop: '4px'}}>
                        Shine with your personalized makeup coach
                    </p>
                </div>

                {/* Makeup Toggle */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#fff0f5',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '24px',
                }}>
                    {['login', 'signup'].map(m => (
                        <button
                        key={m}
                        onClick={() => {
                            setMode(m)
                            setError(null)
                            setMessage(null)
                        }}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '10px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: mode === m ? '500' : '400',
                            backgroundColor: mode === m ? 'white' : 'transparent',
                            color: mode === m ? '#8b3060' : '#c4a0b4',
                            cursor: 'pointer',
                            boxShadow: mode === m ? '0 1px 4px rgba(180,100,140,0.12)' : 'none',
                            transition: 'all 0.2s ease'
                        }}>
                            {m === 'login' ? 'Log in' : 'Sign up'}
                        </button>
                    ))}
                </div>

                {/* Name field - only for signup */}
                {mode === 'signup' && (
                    <div style={{ marginBottom: '14px'}}>
                        <label style={{fontSize: '12px', color: '#c4a0b4', display: 'block', marginBottom: '6px'}}>
                            Your name
                        </label>
                        <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Sarah"
                        style={{
                            width: '100%', padding: '12px 14px',
                            borderRadius: '12px', border: '1px solid #f0d9e6',
                            fontSize: '14px', color: '#6b3050',
                            outline: 'none', backgroundColor: '#fffafc',
                            boxSizing: 'border-box',
                        }} />
                    </div>
                )}

                {/* Email field */}
                <div style={{ marginBottom: '14px'}}>
                    <label style={{fontSize: '12px', color: '#c4a0b4', display: 'block', marginBottom: '6px'}}>
                        Email
                    </label>
                    <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="you@example.com"
                    style={{
                        width: '100%', padding: '12px 14px',
                        borderRadius: '12px', border: '1px solid #f0d9e6',
                        fontSize: '14px', color: '#6b3050',
                        outline: 'none', backgroundColor: '#fffafc',
                        boxSizing: 'border-box',
                    }} />
                </div>

                {/* Password field */}
                <div style={{ marginBottom: '24px'}}>
                    <label style={{fontSize: '12px', color: '#c4a0b4', display: 'block', marginBottom: '6px'}}>
                        Password
                    </label>
                    <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Min. 6 characters"
                    style={{
                        width: '100%', padding: '12px 14px',
                        borderRadius: '12px', border: '1px solid #f0d9e6',
                        fontSize: '14px', color: '#6b3050',
                        outline: 'none', backgroundColor: '#fffafc',
                        boxSizing: 'border-box',
                    }} />
                </div>

                {/* Error message */}
                {error && (
                    <div style={{
                        padding: '10px 14px', borderRadius: '10px',
                        backgroundColor: '#fff0f0', border: '1px solid #f0c0c0',
                        fontSize: '12px', color: '#8b2020', marginBottom: '16px',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Success Message */}
                {message && (
                    <div style={{
                        padding: '10px 14px', borderRadius: '10px',
                        backgroundColor: '#fff0f4', border: '1px solid #f0c0c0',
                        fontSize: '12px', color: '#207850', marginBottom: '16px',
                    }}>
                        ✅ {message}
                    </div>
                )}

                {/* Submit button */}
                <button
                onClick={handleSubmit}
                disabled={loading || !email || !password}
                style={{
                    width: '100%', padding: '14px',
                    borderRadius: '20px', border: 'none',
                    backgroundColor: loading || !email || !password ? '#f0d9e6' : '#8b3060',
                    color: loading || !email || !password ? '#c4a0b4' : 'white',
                    fontSize: '15px', fontWeight: '500',
                    cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                }}>
                    {loading
                    ? 'Please wait...'
                    : mode === 'login' ? 'Log in →' : 'Create account →'}
                </button>

                <p style={{textAlign: 'center', fontSize: '12px', color: '#c4a0b4', marginTop: '20px'}}>
                    {mode === 'login'
                    ? "Dont have an account?"
                    : "Already have an account?"}
                    <span onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login')
                        setError(null)
                        setMessage(null)
                    }}
                    style={{color: '#8b3060', cursor: 'pointer', fontWeight: '500'}}>
                        {mode === 'login' ? 'Sign up' : 'Log in'}
                    </span>
                </p>
            </div>
        </div>
    )
}

export default Auth