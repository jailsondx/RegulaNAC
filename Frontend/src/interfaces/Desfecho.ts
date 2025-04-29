export interface DesfechoData {
  id_user: string;
  id_regulacao: number | null;
  desfecho: string;
  forcado: boolean;
  fastmedic?: boolean;
}

export interface DesfechoExternoData {
  id_user: string;
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