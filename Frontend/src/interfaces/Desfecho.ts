export interface DesfechoData {
  id_user: string;
  id_regulacao: number | null;
  desfecho: string;
  criticidade: string;
  forcado: boolean;
  fastmedic: boolean;
}

export interface DesfechoOptions {
  value: string;
  label: string;
}

export interface CriticidadeOptions {
  value: string;
  label: string;
}