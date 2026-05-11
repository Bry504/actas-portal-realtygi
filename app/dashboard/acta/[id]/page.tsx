import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  CheckSquare,
  List,
  AlertCircle,
  Download,
  Video,
} from 'lucide-react'
import type { ActaCompleta, EstatusAcuerdo } from '@/lib/types'

const estatusColors: Record<EstatusAcuerdo, string> = {
  'Pendiente': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'En proceso': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'Completado': 'bg-green-500/15 text-green-400 border-green-500/20',
  'Cancelado': 'bg-gray-500/15 text-gray-400 border-gray-500/20',
}

export default async function ActaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: acta } = await supabase
    .from('actas')
    .select('*')
    .eq('id', id)
    .single()

  if (!acta) notFound()

  const [
    { data: asistentes },
    { data: agenda },
    { data: acuerdos },
    { data: pendientes },
  ] = await Promise.all([
    supabase.from('asistentes').select('*').eq('acta_id', id).order('orden'),
    supabase.from('agenda').select('*').eq('acta_id', id).order('orden'),
    supabase.from('acuerdos').select('*').eq('acta_id', id).order('numero'),
    supabase.from('pendientes').select('*').eq('acta_id', id).order('numero'),
  ])

  let pdfSignedUrl: string | null = null
  if (acta.pdf_url) {
    const { data } = await supabase.storage
      .from('actas-pdf')
      .createSignedUrl(acta.pdf_url, 3600)
    pdfSignedUrl = data?.signedUrl ?? null
  }

  const fecha = new Date(acta.fecha + 'T00:00:00').toLocaleDateString('es-PE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Volver al dashboard
      </Link>

      {/* Header */}
      <div className="bg-[#2D2D2D] rounded-2xl p-6 mb-6 border border-white/5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-white">{acta.folio}</h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#E8621A]/15 text-[#E8621A] font-medium border border-[#E8621A]/20">
                {acta.area}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400">
                {acta.tipo_reunion}
              </span>
            </div>
            <p className="text-gray-400 text-sm capitalize">{fecha}</p>
          </div>
          {pdfSignedUrl && (
            <a
              href={pdfSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#E8621A] hover:bg-[#D4571A] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </a>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/5">
          <MetaItem icon={<Calendar className="w-4 h-4" />} label="Fecha" value={acta.fecha} />
          <MetaItem
            icon={<Clock className="w-4 h-4" />}
            label="Horario"
            value={`${acta.hora_inicio} – ${acta.hora_fin}`}
          />
          <MetaItem
            icon={<Video className="w-4 h-4" />}
            label="Modalidad"
            value={acta.modalidad}
          />
          {acta.lugar && (
            <MetaItem icon={<MapPin className="w-4 h-4" />} label="Lugar" value={acta.lugar} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
          <MetaItem icon={null} label="Convoca" value={acta.convoca} />
          <MetaItem icon={null} label="Elaboró" value={acta.elaboro} />
        </div>
      </div>

      {/* Resumen ejecutivo */}
      {acta.resumen_ejecutivo && (
        <Section icon={<FileText className="w-5 h-5" />} title="Resumen Ejecutivo">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {acta.resumen_ejecutivo}
          </p>
        </Section>
      )}

      {/* Asistentes */}
      {asistentes && asistentes.length > 0 && (
        <Section icon={<Users className="w-5 h-5" />} title={`Asistentes (${asistentes.length})`}>
          <div className="space-y-2">
            {asistentes.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                <span className="text-xs text-gray-600 w-5 text-right flex-shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-[#E8621A]/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#E8621A] text-xs font-semibold">
                    {a.nombre.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{a.nombre}</p>
                  <p className="text-gray-500 text-xs truncate">{a.cargo}{a.empresa ? ` · ${a.empresa}` : ''}</p>
                </div>
                {a.correo && (
                  <p className="text-gray-600 text-xs truncate hidden sm:block">{a.correo}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Agenda */}
      {agenda && agenda.length > 0 && (
        <Section icon={<List className="w-5 h-5" />} title="Agenda">
          <div className="space-y-2">
            {agenda.map((item) => (
              <div key={item.id} className="flex gap-3 py-2">
                <span className="w-6 h-6 rounded-lg bg-[#E8621A]/15 text-[#E8621A] text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {item.orden}
                </span>
                <div>
                  <p className="text-gray-200 text-sm">{item.descripcion}</p>
                  {item.responsable && (
                    <p className="text-gray-500 text-xs mt-0.5">Responsable: {item.responsable}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Acuerdos */}
      {acuerdos && acuerdos.length > 0 && (
        <Section icon={<CheckSquare className="w-5 h-5" />} title="Acuerdos">
          <div className="space-y-3">
            {acuerdos.map((ac) => (
              <div key={ac.id} className="bg-[#1A1A1A] rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#E8621A] text-xs font-bold">#{ac.numero}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${estatusColors[ac.estatus as EstatusAcuerdo]}`}>
                        {ac.estatus}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm">{ac.descripcion}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {ac.responsable && <span>Responsable: {ac.responsable}</span>}
                      {ac.fecha_limite && <span>Fecha límite: {ac.fecha_limite}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Pendientes */}
      {pendientes && pendientes.length > 0 && (
        <Section icon={<AlertCircle className="w-5 h-5" />} title="Pendientes">
          <div className="space-y-3">
            {pendientes.map((p) => {
              const vencido = p.fecha_limite && new Date(p.fecha_limite) < new Date() && p.estatus !== 'Completado'
              return (
                <div key={p.id} className={`bg-[#1A1A1A] rounded-xl p-4 border ${vencido ? 'border-red-500/30' : 'border-white/5'}`}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[#E8621A] text-xs font-bold">#{p.numero}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${estatusColors[p.estatus as EstatusAcuerdo]}`}>
                      {p.estatus}
                    </span>
                    {vencido && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/20">
                        Vencido
                      </span>
                    )}
                    {p.area_proyecto && (
                      <span className="text-xs text-gray-500">{p.area_proyecto}</span>
                    )}
                  </div>
                  <p className="text-gray-200 text-sm">{p.descripcion}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {p.responsable && <span>Responsable: {p.responsable}</span>}
                    {p.fecha_limite && (
                      <span className={vencido ? 'text-red-400' : ''}>
                        Vence: {p.fecha_limite}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Próxima reunión */}
      {acta.proxima_reunion_fecha && (
        <div className="bg-[#2D2D2D] rounded-2xl p-5 border border-white/5 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E8621A]" />
            Próxima Reunión
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Fecha</p>
              <p className="text-white">{acta.proxima_reunion_fecha}</p>
            </div>
            {acta.proxima_reunion_lugar && (
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Lugar</p>
                <p className="text-white">{acta.proxima_reunion_lugar}</p>
              </div>
            )}
            {acta.proxima_reunion_temas && (
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Temas</p>
                <p className="text-white">{acta.proxima_reunion_temas}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#2D2D2D] rounded-2xl p-5 mb-4 border border-white/5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-[#E8621A]">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode | null; label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className="text-white text-sm flex items-center gap-1.5">
        {icon && <span className="text-[#E8621A]">{icon}</span>}
        {value}
      </p>
    </div>
  )
}
