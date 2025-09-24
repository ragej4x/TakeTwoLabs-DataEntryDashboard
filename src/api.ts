export const API_URL = "https://taketwo-backend.vercel.app";
let authToken: string | null = null;

import { supabase } from './supabase';

// Global loading tracker and subscription API
let inFlightRequests = 0;
const loadingListeners = new Set<(count: number) => void>();
function notifyLoading() {
  for (const cb of loadingListeners) cb(inFlightRequests);
}
export function onGlobalLoadingChange(cb: (count: number) => void) {
  loadingListeners.add(cb);
  return () => loadingListeners.delete(cb);
}

async function request(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    inFlightRequests += 1;
    notifyLoading();
    return await fetch(input, init);
  } finally {
    inFlightRequests = Math.max(0, inFlightRequests - 1);
    notifyLoading();
  }
}

export function setAuthToken(token: string | null) {
  authToken = token;
}

export type ServiceDetailsDTO = {
  isShoeClean?: string;
  serviceType?: string;
  needsReglue?: boolean;
  needsPaint?: boolean;
  qcPassed?: boolean;
  basicCleaning?: string;
  receivedBy?: string;
};

export type EntryDTO = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  itemDescription: string;
  shoeCondition: string;
  shoeService?: string;
  waiverSigned: boolean;
  waiverUrl?: string;
  beforePhotos: string[];
  assignedTo?: string;
  needsReglue?: boolean;
  needsPaint?: boolean;
  status: "pending" | "substantial-completion" | "completed" | string;
  serviceDetails?: ServiceDetailsDTO;
  afterPhotos: string[];
  billing?: number;
  additionalBilling?: number;
  deliveryOption?: "pickup" | "delivery" | string;
  markedAs?: "paid-delivered" | "paid" | "delivered" | "in-progress" | string;
  createdAt: string;
  updatedAt: string;
};

export type EntryCreateDTO = Omit<
  EntryDTO,
  "id" | "createdAt" | "updatedAt" | "status"
> & {
  status?: EntryDTO["status"];
};

export type EntryUpdateDTO = Partial<EntryCreateDTO> & { status?: EntryDTO["status"] };

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function listEntries(): Promise<EntryDTO[]> {
  const res = await request(`${API_URL}/entries`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });
  return handleResponse<EntryDTO[]>(res);
}

export async function createEntry(payload: EntryCreateDTO): Promise<EntryDTO> {
  const res = await request(`${API_URL}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
    body: JSON.stringify(payload),
  });
  return handleResponse<EntryDTO>(res);
}

export async function updateEntryApi(id: string, updates: EntryUpdateDTO): Promise<EntryDTO> {
  const res = await request(`${API_URL}/entries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
    body: JSON.stringify(updates),
  });
  return handleResponse<EntryDTO>(res);
}

export async function uploadWaiver(file: File): Promise<{ url: string }> {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Upload to backend server
    const response = await request(`${API_URL}/upload/waiver`, {
      method: 'POST',
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    return { url: result.url };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Upload failed');
  }
}

export async function loginApi(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const res = await request(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function registerApi(payload: { email: string; password: string; first_name?: string; last_name?: string; phone?: string }) {
  const res = await request(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ access_token: string; token_type: string }>(res);
}

export type MeDTO = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

export async function getMe(): Promise<MeDTO> {
  const res = await request(`${API_URL}/me`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });
  return handleResponse<MeDTO>(res);
}

export async function updateMe(payload: Partial<Omit<MeDTO, 'email'>>): Promise<MeDTO> {
  const res = await request(`${API_URL}/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) },
    body: JSON.stringify(payload),
  });
  return handleResponse<MeDTO>(res);
}


