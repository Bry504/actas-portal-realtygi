export type Rol = 'admin' | 'comercial' | 'administracion' | 'operaciones' | 'legal'
export type Area = 'Comercial' | 'Administración y Finanzas' | 'Operaciones' | 'Legal'
export type EstatusAcuerdo = 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado'
export type EstatusPendiente = 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado'

export interface Perfil {
  id: string
  nombre: string
  cargo: string
  correo: string
  rol: Rol
  activo: boolean
  created_at: string
}

export interface Acta {
  id: string
  folio: string
  area: Area
  tipo_reunion: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  modalidad: string
  lugar: string | null
  convoca: string
  elaboro: string
  resumen_ejecutivo: string | null
  proxima_reunion_fecha: string | null
  proxima_reunion_lugar: string | null
  proxima_reunion_temas: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}

export interface Asistente {
  id: string
  acta_id: string
  nombre: string
  cargo: string
  empresa: string | null
  correo: string | null
  orden: number
}

export interface AgendaItem {
  id: string
  acta_id: string
  orden: number
  descripcion: string
  responsable: string | null
}

export interface Acuerdo {
  id: string
  acta_id: string
  numero: number
  descripcion: string
  responsable: string | null
  fecha_limite: string | null
  estatus: EstatusAcuerdo
}

export interface Pendiente {
  id: string
  acta_id: string
  numero: number
  descripcion: string
  responsable: string | null
  fecha_limite: string | null
  area_proyecto: string | null
  estatus: EstatusPendiente
}

export interface ActaCompleta extends Acta {
  asistentes: Asistente[]
  agenda: AgendaItem[]
  acuerdos: Acuerdo[]
  pendientes: Pendiente[]
}
