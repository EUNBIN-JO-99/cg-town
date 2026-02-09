'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Profile {
  id: string
  username: string
  department: string
  field: string
  project: string
  tmi: string
  tech_stack: string[]
}

export default function DogamEditPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [techInput, setTechInput] = useState('')

  // 폼 상태
  const [field, setField] = useState('')
  const [project, setProject] = useState('')
  const [tmi, setTmi] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])

  useEffect(() => {
    async function fetchMyProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setField(data.field || '')
        setProject(data.project || '')
        setTmi(data.tmi || '')
        setTechStack(data.tech_stack || [])
      }
      setLoading(false)
    }
    fetchMyProfile()
  }, [router])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({
        field,
        project,
        tmi,
        tech_stack: techStack,
      })
      .eq('id', profile.id)

    setSaving(false)
    router.push(`/dogam/${profile.id}`)
  }

  const addTech = () => {
    const trimmed = techInput.trim()
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed])
      setTechInput('')
    }
  }

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech))
  }

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTech()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg">프로필을 찾을 수 없습니다</p>
        <Link href="/auth" className="text-indigo-400 hover:underline">
          로그인하기
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Link
          href="/dogam"
          className="inline-flex items-center text-gray-400 hover:text-white transition mb-6"
        >
          &larr; 도감 목록
        </Link>

        <div className="bg-[#16213e] rounded-2xl border border-gray-800 p-6">
          <h1 className="text-xl font-bold text-white mb-6">
            내 프로필 편집
          </h1>

          {/* Name & Department (read-only) */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-gray-400 text-sm block mb-1">이름</label>
              <div className="bg-gray-800/50 text-gray-300 px-3 py-2 rounded-lg text-sm">
                {profile.username}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">부서</label>
              <div className="bg-gray-800/50 text-gray-300 px-3 py-2 rounded-lg text-sm">
                {profile.department || '-'}
              </div>
            </div>
          </div>

          {/* Field */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm block mb-1">분야</label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="예: 프론트엔드 개발, UX 디자인, PM"
              className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Project */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm block mb-1">현재 프로젝트</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="예: CG Town"
              className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Tech Stack */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm block mb-1">기술스택</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {techStack.map((tech, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm"
                >
                  {tech}
                  <button
                    onClick={() => removeTech(tech)}
                    className="text-indigo-400 hover:text-white ml-1"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="기술명 입력 후 Enter"
                className="flex-1 bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={addTech}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
              >
                추가
              </button>
            </div>
          </div>

          {/* TMI */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm block mb-1">
              TMI
              <span className="text-gray-600 ml-2">
                온오프라인 어디서든 후속 질문을 할 수 있는 TMI를 적어주세요!
              </span>
            </label>
            <textarea
              value={tmi}
              onChange={(e) => setTmi(e.target.value)}
              rows={8}
              placeholder={`예:\n1. 주말엔 겨울잠 핑계로 16시간씩 자는 프로 집순이\n2. 커피보다는 차를 좋아합니다\n3. 자전거 타는거 좋아해요!`}
              className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-3 justify-end">
            <Link
              href="/dogam"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition"
            >
              취소
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
