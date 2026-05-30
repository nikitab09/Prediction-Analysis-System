'use client'

import { useState } from 'react'
import { Send, Minus, ArrowLeft, Wind, LinkIcon } from 'lucide-react'
import { pageStyles } from '../pump/page'
import Link from "next/link";

const COMPRESSOR_API_URL = process.env.NEXT_PUBLIC_COMPRESSOR_API_URL ?? 'http://127.0.0.1:5050/predict/compressor'
const COMPRESSOR_SAVE_URL = process.env.NEXT_PUBLIC_COMPRESSOR_SAVE_URL ?? 'http://127.0.0.1/nextjsbackend/save_compressor_prediction.php'

type CompressorResult = {
  status: 'NORMAL' | 'FAULT' | 'DEGRADED'
  confidence: number
  risk_level: 'Low' | 'Medium' | 'High'
  recommendation: string
}

type Props = { onBack: () => void }

export default function CompressorPage({ onBack }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<CompressorResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const fields = [
    { key: 'rpm', label: 'RPM', placeholder: 'e.g. 2950' },
    { key: 'motor_power', label: 'Motor Power', placeholder: 'e.g. 15.4' },
    { key: 'torque', label: 'Torque', placeholder: 'e.g. 48.2' },
    { key: 'outlet_pressure_bar', label: 'Outlet Pressure (bar)', placeholder: 'e.g. 7.5' },
    { key: 'air_flow', label: 'Air Flow', placeholder: 'e.g. 320' },
    { key: 'noise_db', label: 'Noise (dB)', placeholder: 'e.g. 72' },
    { key: 'outlet_temp', label: 'Outlet Temp', placeholder: 'e.g. 85' },
    { key: 'gaccx', label: 'Accel X (G)', placeholder: 'e.g. 0.12' },
    { key: 'gaccy', label: 'Accel Y (G)', placeholder: 'e.g. 0.09' },
    { key: 'gaccz', label: 'Accel Z (G)', placeholder: 'e.g. 0.15' },
    { key: 'haccx', label: 'H-Accel X', placeholder: 'e.g. 0.04' },
    { key: 'haccy', label: 'H-Accel Y', placeholder: 'e.g. 0.06' },
    { key: 'haccz', label: 'H-Accel Z', placeholder: 'e.g. 0.03' },
    { key: 'bearings', label: 'Bearings', placeholder: 'e.g. 0.21' },
  ]

  const handleChange = (key: string, val: string) =>
    setInputs(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null); setSaved(null)

    try {
      const res = await fetch(COMPRESSOR_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `API error ${res.status}`)
      setResult(data)

      try {
        const saveRes = await fetch(COMPRESSOR_SAVE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...inputs, ...data }),
        })
        const saveData = await saveRes.json()
        setSaved(saveData?.success ? 'Result saved to database.' : 'Shown but not saved.')
      } catch { setSaved('Prediction shown, but saving failed.') }

    } catch (err: any) {
      setError(err.message ?? 'Could not reach the compressor prediction API.')
    } finally { setLoading(false) }
  }

  const statusColor =
    result?.status === 'NORMAL' ? '#10b981' :
      result?.status === 'DEGRADED' ? '#f59e0b' : '#ef4444'

  const statusBg =
    result?.status === 'NORMAL' ? 'rgba(16,185,129,0.1)' :
      result?.status === 'DEGRADED' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'

  return (
    <main className="page-root">
      <div className="page-bg" />
      <div className="page-container">

        {/* Header */}
        <div className="page-header">
          <button onClick={onBack} className="back-btn">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="page-header-text">
            <div className="page-badge compressor-badge">
              <Wind size={12} /> COMPRESSOR DIAGNOSTICS
            </div>
            <h1 className="page-title">Compressor Fault Predictor</h1>
            <p className="page-sub">Enter sensor readings to predict compressor health</p>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <h2 className="section-title">Sensor Readings</h2>
            <p className="section-sub">Enter values for the key sensors below (others default to median)</p>

            <div className="sensors-grid">
              {fields.map(({ key, label, placeholder }) => (
                <div key={key} className="field">
                  <label className="field-label">{label}</label>
                  <input
                    type="number"
                    step="any"
                    placeholder={placeholder}
                    value={inputs[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value)}
                    className="field-input compressor-input"
                  />
                </div>
              ))}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {saved && <div className="alert alert-info">{saved}</div>}

            <button type="submit" disabled={loading} className="submit-btn compressor-btn">
              {loading ? (
                <><span className="spin"><Minus size={18} /></span> Analyzing Compressor...</>
              ) : (
                <><Send size={18} /> Run Fault Detection</>
              )}
            </button>
          </form>
        </div>
        
        <div
    style={{
      textAlign: 'center',
      marginTop: '20px',
      marginBottom: '30px'
    }}
  >
    <Link
      href="/compressor/history"
      style={{
        color: '#60a5fa',
        textDecoration: 'none',
        fontSize: '15px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <LinkIcon size={16} />
      View Prediction History →
    </Link>
  </div>
        

        {/* Result */}
        {result && (
          <div className="card result-card" style={{ borderColor: statusColor + '44' }}>
            <h2 className="section-title">Prediction Result</h2>

            <div className="result-status-row">
              <div className="status-badge" style={{ background: statusBg, color: statusColor, borderColor: statusColor + '55' }}>
                {result.status}
              </div>
              <div className="status-meta">
                <span className="meta-label">Confidence</span>
                <span className="meta-value" style={{ color: statusColor }}>{result.confidence}%</span>
              </div>
              <div className="status-meta">
                <span className="meta-label">Risk Level</span>
                <span className="meta-value">{result.risk_level}</span>
              </div>
            </div>

            <div className="confidence-bar-wrap">
              <div className="confidence-bar" style={{ width: `${result.confidence}%`, background: statusColor }} />
            </div>

            <div className="recommendation-box" style={{ borderColor: statusColor + '33', background: statusBg }}>
              <p className="rec-label">Recommendation</p>
              <p className="rec-text">{result.recommendation}</p>
            </div>
          </div>
        )}
        {result && (
  <div
    style={{
      textAlign: 'center',
      marginTop: '20px',
      marginBottom: '30px'
    }}
  >
    <Link
      href="/compressor/history"
      style={{
        color: '#60a5fa',
        textDecoration: 'none',
        fontSize: '15px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <LinkIcon size={16} />
      View Prediction History →
    </Link>
  </div>
)}
      </div>

      <style>{pageStyles('compressor')}</style>
    </main>
  )
}




