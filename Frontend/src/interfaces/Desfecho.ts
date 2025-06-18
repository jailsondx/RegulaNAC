export interface DesfechoData {
  id_user: number | null;
  id_regulacao: number | null;
  desfecho: string;
  forcado: boolean;
  fastmedic: string | null;
}

export interface DesfechoExternoData {
  id_user: number | null;
  id_regulacao: number | null;
  desfecho: string;
}

export interface DesfechoOptions {
  value: string;
  label: string;
}

export interface CriticidadeOptions {
  value: string;
  label: string;
}