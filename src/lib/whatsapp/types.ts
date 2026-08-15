// Tipos compartilhados do módulo WhatsApp (frontend + backend).

export type WhatsAppConnectionStatus =
  | "pending"
  | "registering"
  | "connected"
  | "error"
  | "revoked";

export interface WhatsAppConnection {
  id: string;
  user_id: string;
  waba_id: string;
  phone_number_id: string | null;
  display_phone_number: string | null;
  verified_name: string | null;
  business_name: string | null;
  status: WhatsAppConnectionStatus;
  error_message: string | null;
  connected_at: string | null;
  created_at: string;
}

/** Payload recebido via window.postMessage ao final do Embedded Signup. */
export interface EmbeddedSignupMessage {
  type: "WA_EMBEDDED_SIGNUP";
  event: "FINISH" | "CANCEL" | "ERROR";
  data?: {
    waba_id?: string;
    phone_number_id?: string;
    business_id?: string;
    current_step?: string;
    error_message?: string;
  };
}

export interface GraphTokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface GraphDebugTokenResponse {
  data: {
    is_valid: boolean;
    expires_at?: number;
    scopes?: string[];
    app_id?: string;
  };
}

export interface GraphWabaInfo {
  id: string;
  name?: string;
  message_template_namespace?: string;
}

export interface GraphPhoneNumber {
  id: string;
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
}
