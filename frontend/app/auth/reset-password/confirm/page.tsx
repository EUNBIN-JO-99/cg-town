'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Supabase 에러 메시지를 사용자 친화적인 한국어로 변환
function getErrorMessage(error: string): string {
  if (error.includes('Password should be at least')) {
    return '비밀번호는 최소 6자 이상이어야 합니다.'
  }
  if (error.includes('New password should be different')) {
    return '새 비밀번호는 기존 비밀번호와 달라야 합니다.'
  }
  if (error.includes('Auth session missing')) {
    return '세션이 만료되었습니다. 비밀번호 재설정 링크를 다시 요청해주세요.'
  }
  return error
}

export default function ResetPasswordConfirmPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    // 비밀번호 일치 확인
    if (newPassword !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.')
      setIsError(true)
      setLoading(false)
      return
    }

    // 비밀번호 최소 길이 확인
    if (newPassword.length < 6) {
      setMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      setIsError(true)
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      // 성공 시 로그인 페이지로 리다이렉트
      router.push('/auth?message=비밀번호가 성공적으로 변경되었습니다.')
    } catch (error: any) {
      const errorMsg = error.message || '오류가 발생했습니다.'
      setMessage(getErrorMessage(errorMsg))
      setIsError(true)
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
            새로운 비밀번호를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 새 비밀번호 */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}
            >
              새 비밀번호
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}
            >
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
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
                backgroundColor: isError ? '#FEF2F2' : '#F0FDF4',
                color: isError ? '#DC2626' : '#16A34A'
              }}
            >
              {message}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            style={{
              width: '100%',
              backgroundColor: '#2563EB',
              color: 'white',
              fontWeight: 600,
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              fontSize: '1rem'
            }}
          >
            {loading ? '처리 중...' : '비밀번호 변경'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#6B7280' }}>
            <Link
              href="/auth"
              style={{
                color: '#2563EB',
                fontWeight: 500,
                textDecoration: 'underline'
              }}
            >
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
