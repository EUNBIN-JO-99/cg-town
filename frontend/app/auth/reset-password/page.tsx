'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password/confirm',
      })

      if (error) throw error

      setIsSuccess(true)
      setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.')
    } catch (error: any) {
      setMessage(error.message || '오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', padding: '16px' }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        style={{ width: '100%', maxWidth: '28rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px' }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            className="text-3xl font-bold text-gray-900 mb-2"
            style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}
          >
            비밀번호 재설정
          </h1>
          <p
            className="text-gray-500"
            style={{ color: '#6B7280' }}
          >
            가입하신 이메일 주소를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 이메일 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isSuccess}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', opacity: isSuccess ? 0.5 : 1 }}
            />
          </div>

          {/* 에러/성공 메시지 */}
          {message && (
            <p
              style={{
                fontSize: '0.875rem',
                textAlign: 'center',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isSuccess ? '#ECFDF5' : '#FEF2F2',
                color: isSuccess ? '#059669' : '#DC2626'
              }}
            >
              {message}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading || isSuccess}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            style={{
              width: '100%',
              backgroundColor: '#2563EB',
              color: 'white',
              fontWeight: 600,
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: (loading || isSuccess) ? 'not-allowed' : 'pointer',
              opacity: (loading || isSuccess) ? 0.5 : 1,
              fontSize: '1rem'
            }}
          >
            {loading ? '처리 중...' : '재설정 링크 보내기'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#6B7280' }}>
            비밀번호가 기억나셨나요?{' '}
            <Link
              href="/auth"
              style={{
                color: '#2563EB',
                fontWeight: 500,
                textDecoration: 'underline'
              }}
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
