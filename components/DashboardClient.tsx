'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, FileText, ChevronRight, Calendar } from 'lucide-react'
import type { Acta, Area } from '@/lib/types'

const AREAS: Area[] = ['Comercial', 'Administración y Finanzas', 'Operaciones', 'Legal']

const areaColors: Record<Area, string> = {
  'Comercial': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Administración y Finanzas': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'Operaciones': 'bg-green-500/15 text-green-400 border-green-500/20',
  'Legal': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
}

export default function DashboardClient({ actas }: { actas: Acta[] }) {
  const [search, setSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState<Area | 'Todas'>('Todas')

  const filtered = actas.filter((a) => {
    const matchesArea = areaFilter === 'Todas' || a.area === areaFilter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      a.folio.toLowerCase().includes(q) ||
      a.tipo_reunion.toLowerCase().includes(q) ||
      a.convoca.toLowerCase().includes(q) ||
      (a.resumen_ejecutivo?.toLowerCase().includes(q) ?? false)
    return matchesArea && matchesSearch
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por folio, tipo o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#2D2D2D] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8621A] text-sm transition-colors"
          />
        </div>
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value as Area | 'Todas')}
          className="bg-[#2D2D2D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E8621A] transition-colors cursor-pointer"
        >
          <option value="Todas">Todas las áreas</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Actas */}
      {filtered.length === 0 ? (
        <div className="bg-[#2D2D2D] rounded-2xl p-12 text-center border border-white/5">
          <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No se encontraron actas</p>
          <p className="text-gray-600 text-sm mt-1">Intenta con otros filtros</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((acta) => (
            <Link
              key={acta.id}
              href={`/dashboard/acta/${acta.id}`}
              className="block bg-[#2D2D2D] rounded-2xl p-5 border border-white/5 hover:border-[#E8621A]/30 hover:bg-[#333333] transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-white font-semibold text-sm">{acta.folio}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${areaColors[acta.area]}`}>
                      {acta.area}
                    </span>
                    <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-0.5 rounded-full">
                      {acta.tipo_reunion}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {acta.resumen_ejecutivo ?? 'Sin resumen ejecutivo'}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(acta.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    <span>{acta.modalidad}</span>
                    <span>Convoca: {acta.convoca}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#E8621A] transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
