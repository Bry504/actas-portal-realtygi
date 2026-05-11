import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react'
import type { EstatusAcuerdo } from '@/lib/types'

const estatusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  'Pendiente': {
    color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  'En proceso': {
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  'Completado': {
    color: 'bg-green-500/15 text-green-400 border-green-500/20',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  'Cancelado': {
    color: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
}

export default async function PendientesPage() {
  const supabase = await createClient()

  const { data: pendientes } = await supabase
    .from('pendientes')
    .select('*, actas(folio, area)')
    .order('fecha_limite', { ascending: true, nullsFirst: false })

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const activos = pendientes?.filter(p => p.estatus === 'Pendiente' || p.estatus === 'En proceso') ?? []
  const vencidos = activos.filter(p => p.fecha_limite && new Date(p.fecha_limite) < hoy)
  const completados = pendientes?.filter(p => p.estatus === 'Completado') ?? []

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Pendientes</h1>
        <p className="text-gray-400 text-sm mt-1">Vista consolidada de todas las actas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#2D2D2D] rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-bold text-white">{activos.length}</p>
          <p className="text-gray-400 text-xs mt-1">Activos</p>
        </div>
        <div className="bg-[#2D2D2D] rounded-2xl p-4 border border-red-500/20 text-center">
          <p className="text-2xl font-bold text-red-400">{vencidos.length}</p>
          <p className="text-gray-400 text-xs mt-1">Vencidos</p>
        </div>
        <div className="bg-[#2D2D2D] rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-bold text-green-400">{completados.length}</p>
          <p className="text-gray-400 text-xs mt-1">Completados</p>
        </div>
      </div>

      {/* Vencidos alert */}
      {vencidos.length > 0 && (
        <div className="bg-red-900/15 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">
            <span className="font-semibold">{vencidos.length} pendiente{vencidos.length !== 1 ? 's' : ''}</span>
            {' '}ha{vencidos.length !== 1 ? 'n' : ''} superado la fecha límite
          </p>
        </div>
      )}

      {/* List */}
      {pendientes && pendientes.length === 0 ? (
        <div className="bg-[#2D2D2D] rounded-2xl p-12 text-center border border-white/5">
          <CheckCircle2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Sin pendientes registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes?.map((p) => {
            const vencido =
              p.fecha_limite &&
              new Date(p.fecha_limite) < hoy &&
              p.estatus !== 'Completado' &&
              p.estatus !== 'Cancelado'
            const cfg = estatusConfig[p.estatus] ?? estatusConfig['Pendiente']

            return (
              <div
                key={p.id}
                className={`bg-[#2D2D2D] rounded-2xl p-5 border transition-colors ${
                  vencido ? 'border-red-500/30' : 'border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                        {cfg.icon}
                        {p.estatus}
                      </span>
                      {vencido && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/20 font-medium">
                          Vencido
                        </span>
                      )}
                      {p.area_proyecto && (
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                          {p.area_proyecto}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-200 text-sm mb-2">{p.descripcion}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      {p.responsable && <span>Responsable: {p.responsable}</span>}
                      {p.fecha_limite && (
                        <span className={vencido ? 'text-red-400 font-medium' : ''}>
                          Vence: {p.fecha_limite}
                        </span>
                      )}
                      {p.actas && (
                        <Link
                          href={`/dashboard/acta/${p.acta_id}`}
                          className="flex items-center gap-1 text-[#E8621A] hover:text-orange-400 transition-colors"
                        >
                          {p.actas.folio}
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
