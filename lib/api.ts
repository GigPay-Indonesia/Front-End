const API_URL = (import.meta.env as ImportMetaEnv & { VITE_API_URL?: string }).VITE_API_URL || 'http://localhost:4000';

const request = async <T>(path: string, options: RequestInit): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Request failed');
    }

    return response.json() as Promise<T>;
};

export const createRecipient = async (payload: Record<string, unknown>): Promise<string> => {
    const data = await request<{ recipient: { id: string } }>('/recipients', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return data.recipient.id;
};

export const createEscrowIntent = async (payload: Record<string, unknown>): Promise<{ id: string }> => {
    return request<{ id: string }>('/escrows/create-intent', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const linkOnchainIntent = async (intentId: string, payload: Record<string, unknown>) => {
    return request<{ intent: { id: string } }>(`/escrows/${intentId}/onchain`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const recordEscrowFunded = async (onchainIntentId: string, payload: Record<string, unknown>) => {
    return request<{ updated: number }>(`/escrows/onchain/${onchainIntentId}/fund`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const recordEscrowSubmitted = async (onchainIntentId: string, payload: Record<string, unknown>) => {
    return request<{ updated: number }>(`/escrows/onchain/${onchainIntentId}/submit-work`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const recordEscrowReleased = async (onchainIntentId: string, payload: Record<string, unknown>) => {
    return request<{ updated: number }>(`/escrows/onchain/${onchainIntentId}/release`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const recordEscrowRefunded = async (onchainIntentId: string, payload: Record<string, unknown>) => {
    return request<{ updated: number }>(`/escrows/onchain/${onchainIntentId}/refund`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const getOnchainIntent = async (onchainIntentId: string) => {
    return request<{ intent: unknown }>(`/escrows/onchain/${onchainIntentId}`, {
        method: 'GET',
    });
};

export const getReleaseData = async (onchainIntentId: string) => {
    return request<{ swapRequired: boolean; swapData?: string }>(`/escrows/onchain/${onchainIntentId}/release-data`, {
        method: 'GET',
    });
};

export const getEscrowIntents = async (filters?: { status?: string; entityType?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.entityType) params.set('entityType', filters.entityType);
    const query = params.toString();
    const path = query ? `/escrows/intents?${query}` : '/escrows/intents';
    return request<{ intents: any[] }>(path, { method: 'GET' });
};

// --- Explore Jobs ---
export const createJob = async (payload: Record<string, unknown>) => {
    return request<{ jobId: string; job: any; milestones: any[]; intents: any[] }>('/jobs', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

export const getJobs = async (opts?: { createdBy?: string; includePrivate?: boolean }) => {
    const params = new URLSearchParams();
    if (opts?.createdBy) params.set('createdBy', opts.createdBy);
    if (opts?.includePrivate) params.set('includePrivate', 'true');
    const q = params.toString();
    return request<{ jobs: any[] }>(q ? `/jobs?${q}` : '/jobs', { method: 'GET' });
};

export const getJob = async (jobId: string) => {
    return request<{ job: any }>(`/jobs/${jobId}`, { method: 'GET' });
};

export const getJobByOnchainIntent = async (onchainIntentId: string) => {
    return request<{ job: any; milestoneIndex: number }>(`/jobs/by-onchain-intent/${onchainIntentId}`, { method: 'GET' });
};

export const joinJob = async (jobId: string, payload: { address: string }) => {
    return request<{ ok: true }>(`/jobs/${jobId}/join`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

// --- Treasury Ops (hybrid backend endpoints) ---
export const getTreasuryOverview = async () => {
    return request<{
        chainId: number;
        treasury: string;
        totals: { idle: string; yieldDeployed: string; escrowLocked: string; total: string };
        perAsset: Array<{
            symbol: string;
            tokenAddress: string;
            idle: string;
            yieldDeployed: string;
            escrowLocked: string;
            total: string;
        }>;
        byStatus: Array<{ status: string; _count: { _all: number } }>;
        snapshots: any[];
        recentEvents: any[];
    }>('/treasury/overview', { method: 'GET' });
};

export const getTreasuryHistory = async (range: '7d' | '30d' | '90d' | '1y' | 'all' = '30d') => {
    const params = new URLSearchParams({ range });
    return request<{ range: string; rows: any[] }>(`/treasury/history?${params.toString()}`, { method: 'GET' });
};

export const getTreasuryActivity = async (opts?: { limit?: number; source?: string }) => {
    const params = new URLSearchParams();
    if (opts?.limit != null) params.set('limit', String(opts.limit));
    if (opts?.source) params.set('source', opts.source);
    const q = params.toString();
    return request<{ rows: any[] }>(q ? `/treasury/activity?${q}` : '/treasury/activity', { method: 'GET' });
};

export const getPaymentIntents = async (opts?: { status?: string }) => {
    const params = new URLSearchParams();
    if (opts?.status) params.set('status', opts.status);
    const q = params.toString();
    return request<{ intents: any[] }>(q ? `/payments/intents?${q}` : '/payments/intents', { method: 'GET' });
};

export const getPaymentIntentHistory = async (onchainIntentId: string) => {
    return request<{ rows: any[] }>(`/payments/intents/${onchainIntentId}/history`, { method: 'GET' });
};
