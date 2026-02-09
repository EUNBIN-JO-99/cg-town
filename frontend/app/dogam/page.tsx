'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCharacterImageUrl, getEmailPrefix } from '@/lib/gameConfig'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  username: string
  department: string
  field: string
  project: string
  tmi: string
  tech_stack: string[]
}

export default function DogamPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfiles() {
      const supabase = createClient()
      const { data } = await supabase.from('profiles').select('*')
      if (data) setProfiles(data)
      setLoading(false)
    }
    fetchProfiles()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">CG Inside 직원 도감</h1>
            <p className="text-gray-400 mt-1">우리 팀원을 소개합니다</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dogam/edit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              내 프로필 편집
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
            >
              게임으로 돌아가기
            </Link>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={`/dogam/${profile.id}`}
              className="group bg-[#16213e] rounded-xl p-4 hover:bg-[#1a2745] transition border border-gray-800 hover:border-indigo-500/50"
            >
              {/* Character Image */}
              <div className="aspect-square bg-[#0f3460]/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {profile.email ? (
                  <img
                    src={getCharacterImageUrl(getEmailPrefix(profile.email), 'front')}
                    alt={profile.username}
                    className="w-3/4 h-3/4 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="text-4xl">👤</div>
                )}
              </div>

              {/* Info */}
              <h3 className="text-white font-semibold text-center truncate">
                {profile.username || '이름 없음'}
              </h3>
              <p className="text-gray-400 text-xs text-center mt-1 truncate">
                {profile.department || ''}
              </p>
              {profile.field && (
                <p className="text-indigo-400 text-xs text-center mt-1 truncate">
                  {profile.field}
                </p>
              )}
            </Link>
          ))}
        </div>

        {profiles.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg">등록된 직원이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
