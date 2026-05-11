import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, CheckSquare, AlertCircle, Search, Filter } from 'lucide-react'
import type { Acta } from '@/lib/types'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  const { data: actas } = await supabase
    .from('actas')
    .select('*')
    .order('fecha', { ascending: false })

  const { data: pendientesData } = await supabase
    .from('pendientes')
    .select('id, estatus')

  const { data: acuerdosData } = await supabase
    .from('acuerdos')
    .select('id, estatus')

  const totalActas = actas?.length ?? 0
  const pendientesActivos = pendientesData?.filter(p => p.estatus === 'Pendiente' || p.estatus === 'En proceso').length ?? 0
  const acuerdosAbiertos = acuerdosData?.filter(a => a.estatus === 'Pendiente' || a.estatus === 'En proceso').length ?? 0

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Actas y reuniones corporativas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total de actas"
          value={totalActas}
          color="orange"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Pendientes activos"
          value={pendientesActivos}
          color="yellow"
        />
        <StatCard
          icon={<CheckSquare className="w-5 h-5" />}
          label="Acuerdos abiertos"
          value={acuerdosAbiertos}
          color="blue"
        />
      </div>

      {/* Actas list with client-side filter */}
      <DashboardClient actas={(actas as Acta[]) ?? []} />
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'orange' | 'yellow' | 'blue'
}) {
  const colors = {
    orange: 'bg-[#E8621A]/15 text-[#E8621A]',
    yellow: 'bg-yellow-500/15 text-yellow-400',
    blue: 'bg-blue-500/15 text-blue-400',
  }

  return (
    <div className="bg-[#2D2D2D] rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-sm">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
