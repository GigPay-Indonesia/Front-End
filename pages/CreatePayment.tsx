import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { decodeEventLog, parseUnits } from 'viem';
import type { Abi } from 'viem';
import { useAccount, useChainId, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { toast } from 'sonner';
import ReactBitsStepper from '../components/ReactBitsStepper';
import { Step1Recipient } from '../components/create-payment/Step1Recipient';
import { Step2Amount } from '../components/create-payment/Step2Amount';
import { Step3Timing } from '../components/create-payment/Step3Timing';
import { Step4Split } from '../components/create-payment/Step4Split';
import { Step5Review } from '../components/create-payment/Step5Review';
import { SidebarTreasury } from '../components/create-payment/SidebarTreasury';
import { ENTITY_DEFAULTS, EntityType } from '../components/create-payment/entityConfig';
import { getTokenAddress } from '../lib/abis';
import { useGigPayRegistry } from '../lib/hooks/useGigPayRegistry';
import { useEscrowCoreContract, useTreasuryVaultContract, useTokenRegistryContract } from '../lib/hooks/useGigPayContracts';
import { ROUTE_PREFERENCE_UINT8, type SwapRoutePreference } from '../lib/swapRoute';
import { createEscrowIntent, createJob, createRecipient, linkOnchainIntent, publishJob } from '../lib/api';

export type ReleaseCondition = 'ON_APPROVAL' | 'ON_DELIVERY' | 'ON_MILESTONE';
export type PayoutMethod = 'ONCHAIN' | 'BANK' | 'HYBRID';
export type SettlementPreference = 'INSTANT' | 'WEEKLY' | 'MONTHLY';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH';
export type ApprovalPolicy = 'AUTO' | 'SINGLE' | 'MULTI' | 'THRESHOLD';

export type VendorProfile = {
    type: 'VENDOR';
    vendorCategory: 'SOFTWARE' | 'HARDWARE' | 'SERVICES' | 'LOGISTICS' | 'MARKETING' | 'OTHER';
    paymentTerms: 'NET0' | 'NET7' | 'NET14' | 'NET30' | 'MILESTONE_BASED';
    invoiceRequired: boolean;
    invoiceEmail: string;
    supportedDocuments: Array<'Invoice' | 'PO' | 'DeliveryProof'>;
    billToEntityName: string;
    taxTreatment: string;
};

export type PartnerProfile = {
    type: 'PARTNER';
    partnerModel: 'REVENUE_SHARE' | 'PROFIT_SHARE' | 'COST_SHARE' | 'AFFILIATE' | 'REFERRAL';
    settlementCycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'PER_CAMPAIGN';
    defaultSplitBps: number;
    programId: string;
    trackingMethod: 'OFFCHAIN_REPORT' | 'ONCHAIN_METRICS' | 'MANUAL_APPROVAL';
    kpiTags: string[];
};

export type AgencyProfile = {
    type: 'AGENCY';
    payoutMode: 'MASTER_PAYEE' | 'SPLIT_TO_TEAM' | 'HYBRID';
    hasSubRecipients: boolean;
    acceptanceWindowDefault: number;
    requiresMilestones: boolean;
};

export type ContractorProfile = {
    type: 'CONTRACTOR';
    engagementType: 'FIXED' | 'HOURLY' | 'RETAINER';
    scopeSummary: string;
    preferredPayoutAsset: string;
    kycLevel: 'NONE' | 'BASIC' | 'VERIFIED';
    disputePreference: 'AUTO_ARBITRATION' | 'MANUAL_REVIEW';
};

export type RecipientProfile = VendorProfile | PartnerProfile | AgencyProfile | ContractorProfile;

export interface PaymentData {
    job: {
        publish: boolean;
        title: string;
        description: string;
        tags: string[];
    };
    recipient: {
        identity: {
            displayName: string;
            legalName: string;
            entityType: EntityType;
            email: string;
            country: string;
            timezone: string;
            referenceId: string;
        };
        payout: {
            preferredAsset: string;
            payoutMethod: PayoutMethod;
            payoutAddress: string;
            bankAccountRef: string;
            settlementPreference: SettlementPreference;
        };
        accounting: {
            counterpartyCode: string;
            costCenter: string;
            tags: string[];
        };
        policy: {
            riskTier: RiskTier;
            approvalPolicy: ApprovalPolicy;
            maxSinglePayment: string;
            maxMonthlyLimit: string;
            requiresEscrowDefault: boolean;
            requiresMilestonesDefault: boolean;
        };
        profile: RecipientProfile;
    };
    amount: {
        value: string;
        fundingAsset: string;
        payoutAsset: string;
    };
    swap: {
        // UI layer can represent FALLBACK_ONLY, but on-chain currently only distinguishes
        // RFQ-only vs allow-fallback. We map FALLBACK_ONLY -> allow-fallback.
        preference: SwapRoutePreference;
    };
    timing: {
        releaseCondition: ReleaseCondition;
        deadline: string;
        enableYield: boolean;
        enableProtection: boolean;
    };
    split: {
        enabled: boolean;
        recipients: Array<{ id: number; name: string; address: string; percentage: number }>;
    };
    milestones: {
        items: Array<{ id: number; title: string; dueDays: string; percentage: number }>;
    };
    notes: string;
}

const INITIAL_DATA: PaymentData = {
    job: {
        publish: true,
        title: 'Brand Identity - EcoVibe Mobile App',
        description: 'Deliver a full brand identity kit with logo variants, typography scale, and color palette. Include mockups showing the brand in action.',
        tags: ['Design', 'Branding', 'Yield'],
    },
    recipient: {
        identity: {
            displayName: 'Nusa Creative Studio',
            legalName: '',
            entityType: 'VENDOR',
            email: 'finance@nusa.studio',
            country: 'Indonesia',
            timezone: 'Asia/Jakarta',
            referenceId: '',
        },
        payout: {
            preferredAsset: 'IDRX',
            payoutMethod: 'ONCHAIN',
            payoutAddress: '0x71c7656EC7ab88b098deFB751B7401B5f6d8976F',
            bankAccountRef: '',
            settlementPreference: 'INSTANT',
        },
        accounting: {
            counterpartyCode: '',
            costCenter: '',
            tags: [],
        },
        policy: {
            riskTier: 'MEDIUM',
            approvalPolicy: 'SINGLE',
            maxSinglePayment: '',
            maxMonthlyLimit: '',
            requiresEscrowDefault: ENTITY_DEFAULTS.VENDOR.requiresEscrowDefault,
            requiresMilestonesDefault: ENTITY_DEFAULTS.VENDOR.requiresMilestonesDefault,
        },
        profile: {
            type: 'VENDOR',
            vendorCategory: 'SERVICES',
            paymentTerms: 'NET14',
            invoiceRequired: false,
            invoiceEmail: '',
            supportedDocuments: ['Invoice', 'PO'],
            billToEntityName: '',
            taxTreatment: '',
        },
    },
    amount: {
        value: '45.000.000',
        fundingAsset: 'IDRX',
        payoutAsset: 'IDRX',
    },
    swap: {
        // Requested default behavior: fallback-only when a swap is required.
        preference: 'FALLBACK_ONLY',
    },
    timing: {
        releaseCondition: 'ON_APPROVAL',
        deadline: '7 Days',
        enableYield: true,
        enableProtection: false,
    },
    split: {
        enabled: false,
        recipients: [{ id: 1, name: 'Primary Recipient', address: '0x71c7656EC7ab88b098deFB751B7401B5f6d8976F', percentage: 100 }],
    },
    milestones: {
        items: [],
    },
    notes: '',
};

export const CreatePayment: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { address } = useAccount();
    const chainId = useChainId();
    const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentData, setPaymentData] = useState<PaymentData>(INITIAL_DATA);
    const [recipientId, setRecipientId] = useState<string | null>(null);
    const [escrowIntentId, setEscrowIntentId] = useState<string | null>(null);
    const { tokenRegistryAddress, routeRegistryAddress, yieldManagerAddress } = useGigPayRegistry();
    const escrowCore = useEscrowCoreContract();
    const treasuryVault = useTreasuryVaultContract();
    const tokenRegistry = useTokenRegistryContract();
    const { writeContract, data: createTxHash, isPending: isCreating, error: writeError } = useWriteContract();
    const writeContractUnsafe = writeContract as unknown as (args: any) => void;
    const { data: createReceipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: createTxHash,
    });

    const [createError, setCreateError] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [publishFailed, setPublishFailed] = useState(false);
    const [queue, setQueue] = useState<Array<{ milestoneIndex: number; escrowIntentId: string; amountRaw: string; deadlineDays: number }>>([]);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [linked, setLinked] = useState<Array<{ milestoneIndex: number; escrowIntentId: string; onchainIntentId: string; txHash: string }>>([]);
    const [confirmLock, setConfirmLock] = useState(false);
    const processedTxHashesRef = useRef<Set<string>>(new Set());
    const notifiedTxHashesRef = useRef<Set<string>>(new Set());
    const [swapFallbackNote, setSwapFallbackNote] = useState<string | null>(null);

    const debugLog = (hypothesisId: string, location: string, message: string, data: Record<string, unknown>) => {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/db4bbdf7-65ed-4d2d-8f1f-a869c687e301', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'debug-session',
                runId: 'payment-create',
                hypothesisId,
                location,
                message,
                data,
                timestamp: Date.now(),
            }),
        }).catch(() => { });
        // #endregion agent log
    };

    useEffect(() => {
        debugLog('H0', 'pages/CreatePayment.tsx:mount', 'CREATE_PAYMENT_MOUNT', {
            hasAddress: Boolean(address),
            currentStep,
            hasSwap: Boolean((paymentData as any)?.swap),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const BASE_SEPOLIA_CHAIN_ID = 84532;
    const isOnBaseSepolia = chainId === BASE_SEPOLIA_CHAIN_ID;

    const handleSwitchToBaseSepolia = async () => {
        try {
            await switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
        } catch (e: any) {
            toast.error(e?.message || 'Unable to switch network.');
        }
    };

    useEffect(() => {
        if (!confirmLock) return;
        if (!writeError) return;
        debugLog('H1', 'pages/CreatePayment.tsx:writeError', 'WRITE_CONTRACT_ERROR', {
            message: String((writeError as any)?.message || writeError || ''),
        });
        toast.error((writeError as any)?.message || 'Wallet transaction failed or was rejected.');
        // Allow user to retry if wallet rejects / write fails.
        setConfirmLock(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [writeError]);

    useEffect(() => {
        if (!createTxHash) return;
        if (notifiedTxHashesRef.current.has(createTxHash)) return;
        notifiedTxHashesRef.current.add(createTxHash);
        toast.message('Transaction sent. Waiting for confirmation…');
    }, [createTxHash]);

    const updateData = (field: keyof PaymentData, value: any) => {
        setPaymentData(prev => ({ ...prev, [field]: value }));
    };

    const formatThousands = (raw: string) => {
        const digits = raw.replace(/[^0-9]/g, '');
        if (!digits) return '';
        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    useEffect(() => {
        const resume = (location.state as any)?.resumeEscrowIntent;
        if (!resume) return;

        try {
            const r = resume.recipient || {};
            const payout = r.payout || {};
            const accounting = r.accounting || {};
            const policy = r.policy || {};

            const entityType = (resume.entityType || r.entityType || 'VENDOR') as EntityType;

            const profile: RecipientProfile =
                entityType === 'VENDOR'
                    ? {
                        type: 'VENDOR',
                        vendorCategory: r.vendorProfile?.vendorCategory || 'SERVICES',
                        paymentTerms: r.vendorProfile?.paymentTerms || 'NET14',
                        invoiceRequired: Boolean(r.vendorProfile?.invoiceRequired),
                        invoiceEmail: r.vendorProfile?.invoiceEmail || '',
                        supportedDocuments: r.vendorProfile?.supportedDocuments || ['Invoice'],
                        billToEntityName: r.vendorProfile?.billToEntityName || '',
                        taxTreatment: r.vendorProfile?.taxTreatment || '',
                    }
                    : entityType === 'PARTNER'
                        ? {
                            type: 'PARTNER',
                            partnerModel: r.partnerProfile?.partnerModel || 'REVENUE_SHARE',
                            settlementCycle: r.partnerProfile?.settlementCycle || 'MONTHLY',
                            defaultSplitBps: r.partnerProfile?.defaultSplitBps || 0,
                            programId: r.partnerProfile?.programId || '',
                            trackingMethod: r.partnerProfile?.trackingMethod || 'MANUAL_APPROVAL',
                            kpiTags: r.partnerProfile?.kpiTags || [],
                        }
                        : entityType === 'AGENCY'
                            ? {
                                type: 'AGENCY',
                                payoutMode: r.agencyProfile?.payoutMode || 'MASTER_PAYEE',
                                hasSubRecipients: Boolean(r.agencyProfile?.hasSubRecipients),
                                acceptanceWindowDefault: r.agencyProfile?.acceptanceWindowDefault || 7,
                                requiresMilestones: Boolean(r.agencyProfile?.requiresMilestones),
                            }
                            : {
                                type: 'CONTRACTOR',
                                engagementType: r.contractorProfile?.engagementType || 'FIXED',
                                scopeSummary: r.contractorProfile?.scopeSummary || '',
                                preferredPayoutAsset: r.contractorProfile?.preferredPayoutAsset || payout.preferredAsset || 'IDRX',
                                kycLevel: r.contractorProfile?.kycLevel || 'BASIC',
                                disputePreference: r.contractorProfile?.disputePreference || 'AUTO_ARBITRATION',
                            };

            const amountStr = String(resume.amount ?? '').split('.')[0];

            const splitConfig = resume.splitConfig;
            const splitRecipients =
                Array.isArray(splitConfig) && splitConfig.length
                    ? splitConfig.map((s: any, idx: number) => ({
                        id: idx + 1,
                        name: `Recipient ${idx + 1}`,
                        address: s.recipient || '',
                        percentage: (Number(s.bps || 0) / 100) || 0,
                    }))
                    : [{ id: 1, name: 'Primary Recipient', address: payout.payoutAddress || '', percentage: 100 }];

            setPaymentData((prev) => ({
                ...prev,
                recipient: {
                    identity: {
                        displayName: r.displayName || prev.recipient.identity.displayName,
                        legalName: r.legalName || '',
                        entityType,
                        email: r.billingEmail || prev.recipient.identity.email,
                        country: r.country || prev.recipient.identity.country,
                        timezone: r.timezone || prev.recipient.identity.timezone,
                        referenceId: r.referenceId || '',
                    },
                    payout: {
                        preferredAsset: payout.preferredAsset || resume.fundingAsset || prev.recipient.payout.preferredAsset,
                        payoutMethod: payout.payoutMethod || prev.recipient.payout.payoutMethod,
                        payoutAddress: payout.payoutAddress || prev.recipient.payout.payoutAddress,
                        bankAccountRef: payout.bankAccountRef || '',
                        settlementPreference: payout.settlementPreference || prev.recipient.payout.settlementPreference,
                    },
                    accounting: {
                        counterpartyCode: accounting.counterpartyCode || '',
                        costCenter: accounting.costCenter || '',
                        tags: accounting.tags || [],
                    },
                    policy: {
                        riskTier: policy.riskTier || prev.recipient.policy.riskTier,
                        approvalPolicy: policy.approvalPolicy || prev.recipient.policy.approvalPolicy,
                        maxSinglePayment: policy.maxSinglePayment ? String(policy.maxSinglePayment).split('.')[0] : '',
                        maxMonthlyLimit: policy.maxMonthlyLimit ? String(policy.maxMonthlyLimit).split('.')[0] : '',
                        requiresEscrowDefault: policy.requiresEscrowDefault ?? prev.recipient.policy.requiresEscrowDefault,
                        requiresMilestonesDefault: policy.requiresMilestonesDefault ?? prev.recipient.policy.requiresMilestonesDefault,
                    },
                    profile,
                },
                amount: {
                    value: formatThousands(amountStr),
                    fundingAsset: resume.fundingAsset || prev.amount.fundingAsset,
                    payoutAsset: resume.payoutAsset || resume.fundingAsset || prev.amount.payoutAsset,
                },
                timing: {
                    releaseCondition: resume.releaseCondition || prev.timing.releaseCondition,
                    deadline: `${resume.deadlineDays || 7} Days`,
                    enableYield: Boolean(resume.enableYield),
                    enableProtection: Boolean(resume.enableProtection),
                },
                split: {
                    enabled: Array.isArray(splitConfig) ? splitConfig.length > 1 : Boolean(prev.split.enabled),
                    recipients: splitRecipients,
                },
                milestones: {
                    items: Array.isArray(resume.milestoneTemplate) ? resume.milestoneTemplate : prev.milestones.items,
                },
                notes: resume.notes || '',
            }));

            if (resume.recipientId) setRecipientId(String(resume.recipientId));
            if (resume.id) setEscrowIntentId(String(resume.id));
            setCurrentStep(5);
            toast.message('Resumed draft payment. Review and confirm to create on-chain intent.');
        } catch {
            // ignore bad resume payloads
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const applyEntityDefaults = (entityType: EntityType) => {
        setPaymentData(prev => {
            const defaults = ENTITY_DEFAULTS[entityType];
            const nextProfile: RecipientProfile = entityType === 'VENDOR'
                ? {
                    type: 'VENDOR',
                    vendorCategory: 'SERVICES',
                    paymentTerms: 'NET14',
                    invoiceRequired: false,
                    invoiceEmail: '',
                    supportedDocuments: ['Invoice', 'PO'],
                    billToEntityName: '',
                    taxTreatment: '',
                }
                : entityType === 'PARTNER'
                    ? {
                        type: 'PARTNER',
                        partnerModel: 'REVENUE_SHARE',
                        settlementCycle: 'MONTHLY',
                        defaultSplitBps: 0,
                        programId: '',
                        trackingMethod: 'MANUAL_APPROVAL',
                        kpiTags: [],
                    }
                    : entityType === 'AGENCY'
                        ? {
                            type: 'AGENCY',
                            payoutMode: 'MASTER_PAYEE',
                            hasSubRecipients: false,
                            acceptanceWindowDefault: 7,
                            requiresMilestones: true,
                        }
                        : {
                            type: 'CONTRACTOR',
                            engagementType: 'FIXED',
                            scopeSummary: '',
                            preferredPayoutAsset: prev.recipient.payout.preferredAsset || 'IDRX',
                            kycLevel: 'BASIC',
                            disputePreference: 'AUTO_ARBITRATION',
                        };

            return {
                ...prev,
                recipient: {
                    ...prev.recipient,
                    identity: {
                        ...prev.recipient.identity,
                        entityType,
                    },
                    policy: {
                        ...prev.recipient.policy,
                        requiresEscrowDefault: defaults.requiresEscrowDefault,
                        requiresMilestonesDefault: defaults.requiresMilestonesDefault,
                    },
                    profile: nextProfile,
                },
                timing: {
                    ...prev.timing,
                    releaseCondition: defaults.releaseCondition,
                },
            };
        });
    };

    useEffect(() => {
        const template = (location.state as { template?: any } | undefined)?.template;
        if (!template) return;

        setPaymentData(prev => ({
            ...prev,
            amount: {
                ...prev.amount,
                value: typeof template.budget === 'string' ? template.budget.replace(/,/g, '.') : prev.amount.value,
            },
            timing: {
                ...prev.timing,
                enableProtection: Array.isArray(template.tags) && template.tags.includes('Protection'),
                enableYield: Array.isArray(template.tags) && template.tags.includes('Yield'),
            },
            notes: template.description || prev.notes,
        }));
    }, [location.state]);

    useEffect(() => {
        setPaymentData((prev) => {
            if (!prev.split.recipients.length) return prev;
            if (prev.split.recipients[0].address) return prev;
            const updated = [...prev.split.recipients];
            updated[0] = { ...updated[0], address: prev.recipient.payout.payoutAddress };
            return { ...prev, split: { ...prev.split, recipients: updated } };
        });
    }, [paymentData.recipient.payout.payoutAddress]);

    useEffect(() => {
        if (paymentData.recipient.profile.type !== 'CONTRACTOR') return;
        if (paymentData.recipient.profile.preferredPayoutAsset === paymentData.recipient.payout.preferredAsset) return;
        setPaymentData(prev => {
            if (prev.recipient.profile.type !== 'CONTRACTOR') return prev;
            return {
                ...prev,
                recipient: {
                    ...prev.recipient,
                    profile: {
                        ...prev.recipient.profile,
                        preferredPayoutAsset: prev.recipient.payout.preferredAsset,
                    },
                },
            };
        });
    }, [
        paymentData.recipient.payout.preferredAsset,
        paymentData.recipient.profile.type,
        paymentData.recipient.profile.type === 'CONTRACTOR' ? paymentData.recipient.profile.preferredPayoutAsset : '',
    ]);

    const fundingAssetAddress = useMemo(() => getTokenAddress(paymentData.amount.fundingAsset), [paymentData.amount.fundingAsset]);
    const payoutAssetAddress = useMemo(() => getTokenAddress(paymentData.amount.payoutAsset), [paymentData.amount.payoutAsset]);

    const tokenConfig = useReadContract({
        address: (tokenRegistryAddress || tokenRegistry.address) as `0x${string}` | undefined,
        abi: tokenRegistry.abi as Abi,
        functionName: 'tokenConfig',
        args: fundingAssetAddress ? [fundingAssetAddress] : undefined,
        query: { enabled: Boolean((tokenRegistryAddress || tokenRegistry.address) && tokenRegistry.abi && fundingAssetAddress) },
    });

    const isEscrowEligible = useReadContract({
        address: (tokenRegistryAddress || tokenRegistry.address) as `0x${string}` | undefined,
        abi: tokenRegistry.abi as Abi,
        functionName: 'isEscrowEligible',
        args: fundingAssetAddress ? [fundingAssetAddress] : undefined,
        query: { enabled: Boolean((tokenRegistryAddress || tokenRegistry.address) && tokenRegistry.abi && fundingAssetAddress) },
    });

    const isPayoutEligible = useReadContract({
        address: (tokenRegistryAddress || tokenRegistry.address) as `0x${string}` | undefined,
        abi: tokenRegistry.abi as Abi,
        functionName: 'isEscrowEligible',
        args: payoutAssetAddress ? [payoutAssetAddress] : undefined,
        query: { enabled: Boolean((tokenRegistryAddress || tokenRegistry.address) && tokenRegistry.abi && payoutAssetAddress) },
    });

    const parsedAmount = useMemo(() => {
        const raw = paymentData.amount.value.replace(/\./g, '');
        const decimals = (tokenConfig.data as { decimals?: number } | undefined)?.decimals ?? 18;
        try {
            return parseUnits(raw || '0', Number(decimals));
        } catch {
            return 0n;
        }
    }, [paymentData.amount.value, tokenConfig.data]);

    const splitBps = useMemo(() => {
        return paymentData.split.recipients.map((recipient) => ({
            recipient: recipient.address || paymentData.recipient.payout.payoutAddress,
            bps: Math.round(recipient.percentage * 100),
        }));
    }, [paymentData.split.recipients, paymentData.recipient.payout.payoutAddress]);

    const totalBps = useMemo(() => splitBps.reduce((sum, split) => sum + split.bps, 0), [splitBps]);
    const isSplitValid = totalBps === 10000;
    const isTokenEligible = isEscrowEligible.data !== false;
    const isPayoutTokenEligible = isPayoutEligible.data !== false;

    const swapRequired = Boolean(
        fundingAssetAddress &&
        payoutAssetAddress &&
        fundingAssetAddress.toLowerCase() !== payoutAssetAddress.toLowerCase()
    );

    const routeRegistryAbi = useMemo(
        () =>
            [
                {
                    type: 'function',
                    name: 'getRoute',
                    stateMutability: 'view',
                    inputs: [
                        { name: 'assetIn', type: 'address' },
                        { name: 'assetOut', type: 'address' },
                    ],
                    outputs: [
                        {
                            name: '',
                            type: 'tuple',
                            components: [
                                { name: 'rfqAllowed', type: 'bool' },
                                { name: 'fallbackAllowed', type: 'bool' },
                                { name: 'rfqVenue', type: 'address' },
                                { name: 'fallbackVenue', type: 'address' },
                            ],
                        },
                    ],
                },
            ] as const satisfies Abi,
        []
    );

    const routeConfig = useReadContract({
        address: routeRegistryAddress as `0x${string}` | undefined,
        abi: routeRegistryAbi as any,
        functionName: 'getRoute',
        args: swapRequired && fundingAssetAddress && payoutAssetAddress ? [fundingAssetAddress, payoutAssetAddress] : undefined,
        query: { enabled: Boolean(routeRegistryAddress && swapRequired && fundingAssetAddress && payoutAssetAddress) },
    });

    const isSwapRouteValid = useMemo(() => {
        if (!swapRequired) return true;
        const r = routeConfig.data as any;
        return Boolean(r && (r.rfqAllowed || r.fallbackAllowed));
    }, [swapRequired, routeConfig.data]);

    const treasuryAssetConfig = useReadContract({
        address: treasuryVault.address as `0x${string}` | undefined,
        abi: treasuryVault.abi as Abi,
        functionName: 'assetConfig',
        args: fundingAssetAddress ? [fundingAssetAddress] : undefined,
        query: { enabled: Boolean(treasuryVault.address && treasuryVault.abi && fundingAssetAddress) },
    });

    const effectiveStrategyId = useMemo(() => {
        if (!paymentData.timing.enableYield) return 0;
        const cfg = treasuryAssetConfig.data as any;
        const enabled = Boolean(cfg?.[0]);
        const strategyId = Number(cfg?.[1] ?? 0);
        if (!enabled) return 0;
        return strategyId;
    }, [paymentData.timing.enableYield, treasuryAssetConfig.data]);

    const yieldManagerAbi = useMemo(
        () =>
            [
                {
                    type: 'function',
                    name: 'strategies',
                    stateMutability: 'view',
                    inputs: [{ name: '', type: 'uint32' }],
                    outputs: [
                        { name: 'strategy', type: 'address' },
                        { name: 'allowed', type: 'bool' },
                    ],
                },
            ] as const satisfies Abi,
        []
    );

    const strategyRead = useReadContract({
        address: yieldManagerAddress as `0x${string}` | undefined,
        abi: yieldManagerAbi as any,
        functionName: 'strategies',
        args: paymentData.timing.enableYield && effectiveStrategyId ? [effectiveStrategyId] : undefined,
        query: { enabled: Boolean(yieldManagerAddress && paymentData.timing.enableYield && effectiveStrategyId) },
    });

    const isYieldStrategyAllowed = useMemo(() => {
        if (!paymentData.timing.enableYield) return true;
        if (!effectiveStrategyId) return false;
        const data = strategyRead.data as any;
        const allowed = Boolean(data?.[1]);
        return allowed;
    }, [paymentData.timing.enableYield, effectiveStrategyId, strategyRead.data]);

    // Auto-fallback: if yield is enabled but the treasury-selected strategy is not allowed on-chain,
    // auto-disable yield so Confirm can proceed (consistent UX).
    useEffect(() => {
        if (!paymentData.timing.enableYield) return;
        if (!effectiveStrategyId) return;
        if (!yieldManagerAddress) return;
        if (strategyRead.isLoading) return;

        const allowed = Boolean((strategyRead.data as any)?.[1]);
        if (allowed) return;

        toast.message('Yield strategy is not allowed for this asset. Disabling yield for this payment.');
        setPaymentData((prev) => ({
            ...prev,
            timing: {
                ...prev.timing,
                enableYield: false,
            },
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentData.timing.enableYield, effectiveStrategyId, yieldManagerAddress, strategyRead.isLoading, strategyRead.data]);

    const isSplitRequired = useMemo(() => {
        const profile = paymentData.recipient.profile;
        if (profile.type === 'AGENCY') {
            return profile.payoutMode !== 'MASTER_PAYEE';
        }
        if (profile.type === 'PARTNER') {
            return (profile.defaultSplitBps || 0) > 0;
        }
        return paymentData.split.enabled;
    }, [paymentData.recipient.profile, paymentData.split.enabled]);

    const isMilestoneRequired = useMemo(() => {
        const profile = paymentData.recipient.profile;
        if (profile.type === 'AGENCY') return profile.requiresMilestones;
        if (profile.type === 'VENDOR') return profile.paymentTerms === 'MILESTONE_BASED';
        return paymentData.recipient.policy.requiresMilestonesDefault;
    }, [paymentData.recipient.profile, paymentData.recipient.policy.requiresMilestonesDefault]);

    useEffect(() => {
        if (!isMilestoneRequired) return;
        if (paymentData.milestones.items.length > 0) return;
        setPaymentData(prev => ({
            ...prev,
            milestones: {
                items: [{ id: 1, title: '', dueDays: '', percentage: 0 }],
            },
        }));
    }, [isMilestoneRequired, paymentData.milestones.items.length]);

    const isDataValid = useMemo(() => {
        const identity = paymentData.recipient.identity;
        const payout = paymentData.recipient.payout;
        const policy = paymentData.recipient.policy;
        const profile = paymentData.recipient.profile;
        const job = paymentData.job;

        if (!identity.displayName || !identity.email || !identity.country || !identity.timezone) return false;
        if (!payout.preferredAsset || !payout.payoutMethod || !payout.settlementPreference) return false;
        if ((payout.payoutMethod === 'ONCHAIN' || payout.payoutMethod === 'HYBRID') && !payout.payoutAddress) return false;
        if ((payout.payoutMethod === 'BANK' || payout.payoutMethod === 'HYBRID') && !payout.bankAccountRef) return false;
        if (!policy.riskTier || !policy.approvalPolicy) return false;
        if (!paymentData.amount.value || !paymentData.amount.fundingAsset || !paymentData.amount.payoutAsset) return false;
        if (swapRequired && !isSwapRouteValid) return false;
        if (!paymentData.timing.releaseCondition || !paymentData.timing.deadline) return false;

        if (profile.type === 'VENDOR') {
            if (!profile.vendorCategory || !profile.paymentTerms) return false;
            if (profile.invoiceRequired && !profile.invoiceEmail) return false;
        }
        if (profile.type === 'PARTNER') {
            if (!profile.partnerModel || !profile.settlementCycle || !profile.trackingMethod) return false;
        }
        if (profile.type === 'AGENCY') {
            if (!profile.payoutMode) return false;
        }
        if (profile.type === 'CONTRACTOR') {
            if (!profile.engagementType || !profile.scopeSummary || !profile.preferredPayoutAsset) return false;
        }

        if (isSplitRequired && !isSplitValid) return false;

        if (isMilestoneRequired) {
            if (!paymentData.milestones.items.length) return false;
            const milestoneTotal = paymentData.milestones.items.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);
            if (milestoneTotal !== 100) return false;
        }

        if (job.publish) {
            if (!job.title.trim()) return false;
            if (!job.description.trim()) return false;
        }

        return true;
    }, [paymentData, isMilestoneRequired, isSplitRequired, isSplitValid, swapRequired, isSwapRouteValid]);

    const parseDays = (value: string) => {
        const numeric = Number(value.replace(/[^0-9]/g, ''));
        return Number.isNaN(numeric) || numeric <= 0 ? 0 : numeric;
    };

    const startCreateIntentTx = (milestoneIdx: number, amountRaw: string, deadlineDays: number) => {
        if (!escrowCore.address || !escrowCore.abi || !treasuryVault.address) return;
        if (!fundingAssetAddress) return;
        const decimals = (tokenConfig.data as { decimals?: number } | undefined)?.decimals ?? 18;

        let amount = 0n;
        try {
            amount = parseUnits(amountRaw || '0', Number(decimals));
        } catch {
            amount = 0n;
        }
        if (amount === 0n) return;

        const now = Math.floor(Date.now() / 1000);
        const deadline = BigInt(now + Number(deadlineDays) * 86400);
        const acceptanceWindow = BigInt(Number(deadlineDays) * 86400);

        const escrowYieldEnabled = Boolean(paymentData.timing.enableYield && effectiveStrategyId && isYieldStrategyAllowed);
        const escrowStrategyId = escrowYieldEnabled ? effectiveStrategyId : 0;
        const usePayout = payoutAssetAddress && payoutAssetAddress !== fundingAssetAddress;
        const preferredRoute = ROUTE_PREFERENCE_UINT8[paymentData.swap.preference];

        setActiveIdx(milestoneIdx);
        debugLog('H2', 'pages/CreatePayment.tsx:startCreateIntentTx', 'WRITE_CONTRACT_ATTEMPT', {
            milestoneIdx,
            amountRaw,
            deadlineDays,
            usePayout: Boolean(usePayout),
            escrowYieldEnabled,
            escrowStrategyId,
            preferredRoute,
            queueLen: queue.length,
            linkedLen: linked.length,
        });

        toast.message('Check your wallet to approve the escrow intent.');

        if (usePayout) {
            writeContractUnsafe({
                address: escrowCore.address,
                abi: escrowCore.abi as Abi,
                functionName: 'createIntentFromTreasuryWithPayout',
                args: [
                    treasuryVault.address,
                    fundingAssetAddress,
                    payoutAssetAddress,
                    amount,
                    deadline,
                    acceptanceWindow,
                    splitBps,
                    escrowYieldEnabled,
                    escrowStrategyId,
                    preferredRoute,
                ],
            });
            return;
        }

        writeContractUnsafe({
            address: escrowCore.address,
            abi: escrowCore.abi as Abi,
            functionName: 'createIntentFromTreasury',
            args: [
                treasuryVault.address,
                fundingAssetAddress,
                amount,
                deadline,
                acceptanceWindow,
                splitBps,
                escrowYieldEnabled,
                escrowStrategyId,
            ],
        });
    };

    const handleCreateIntent = async () => {
        if (!address) {
            toast.error('Connect your wallet to create the escrow intent.');
            return;
        }
        if (!isOnBaseSepolia) {
            toast.message('Switch to Base Sepolia to confirm.');
            handleSwitchToBaseSepolia();
            return;
        }
        if (!escrowCore.address || !escrowCore.abi || !treasuryVault.address) {
            toast.error('Contracts not ready. Check network or registry configuration.');
            return;
        }
        if (!fundingAssetAddress || parsedAmount === 0n) {
            toast.error('Enter a valid amount and funding asset.');
            return;
        }
        if (swapRequired && !isSwapRouteValid) {
            toast.error('No swap route available for the selected payout asset.');
            return;
        }
        if (isSplitRequired && !isSplitValid) {
            toast.error('Split percentages must total 100%.');
            return;
        }
        if (!isTokenEligible) {
            toast.error('Funding token is not escrow eligible.');
            return;
        }
        if (!isPayoutTokenEligible) {
            toast.error('Payout token is not eligible.');
            return;
        }
        if (!isDataValid) {
            toast.error('Complete all required fields before confirming.');
            return;
        }
        if (confirmLock) return;

        setCreateError(null);
        setPublishFailed(false);
        setConfirmLock(true);

        const days = parseDays(paymentData.timing.deadline);
        const rawTotal = paymentData.amount.value.replace(/\./g, '');

        debugLog('H1', 'pages/CreatePayment.tsx:handleCreateIntent', 'CONFIRM_BEGIN', {
            addressPresent: Boolean(address),
            chainId,
            jobPublish: Boolean(paymentData.job.publish),
            releaseCondition: paymentData.timing.releaseCondition,
            amountRaw: rawTotal,
            fundingAsset: paymentData.amount.fundingAsset,
            payoutAsset: paymentData.amount.payoutAsset,
            splitRecipients: paymentData.split.recipients.length,
            milestonesCount: paymentData.milestones.items.length,
        });

        try {
            const createdRecipientId = recipientId || await createRecipient({
                identity: paymentData.recipient.identity,
                payout: paymentData.recipient.payout,
                accounting: paymentData.recipient.accounting,
                policy: paymentData.recipient.policy,
                profile: paymentData.recipient.profile,
                splitTemplates: paymentData.split.recipients.map((recipient) => ({
                    templateName: 'Default',
                    recipientWalletOrRef: recipient.address || paymentData.recipient.payout.payoutAddress,
                    bps: Math.round(recipient.percentage * 100),
                })),
            });
            if (!recipientId) setRecipientId(createdRecipientId);

            const shouldPublishJob = Boolean(paymentData.job.publish);

            if (shouldPublishJob) {
                try {
                    debugLog('H3', 'pages/CreatePayment.tsx:handleCreateIntent', 'CREATE_JOB_REQUEST', {
                        createdByPresent: Boolean(address),
                        titleLen: paymentData.job.title?.length || 0,
                        descLen: paymentData.job.description?.length || 0,
                        tagsCount: paymentData.job.tags?.length || 0,
                        amountRaw: rawTotal,
                        milestonesCount: paymentData.milestones.items.length,
                    });
                    const jobRes = await createJob({
                        createdBy: address || '',
                        job: {
                            // Publish only after on-chain intents are created & linked.
                            isPublic: false,
                            title: paymentData.job.title,
                            description: paymentData.job.description,
                            tags: paymentData.job.tags,
                            notes: paymentData.notes,
                        },
                        payment: {
                            recipientId: createdRecipientId,
                            entityType: paymentData.recipient.identity.entityType,
                            amount: rawTotal,
                            fundingAsset: paymentData.amount.fundingAsset,
                            payoutAsset: paymentData.amount.payoutAsset,
                            releaseCondition: paymentData.timing.releaseCondition,
                            deadlineDays: days,
                            acceptanceWindowDays: days,
                            enableYield: Boolean(paymentData.timing.enableYield && effectiveStrategyId && isYieldStrategyAllowed),
                            enableProtection: paymentData.timing.enableProtection,
                            splitConfig: splitBps,
                            milestones: paymentData.milestones.items.map((m) => ({
                                title: m.title,
                                dueDays: String(m.dueDays || ''),
                                percentage: Number(m.percentage) || 0,
                            })),
                            notes: paymentData.notes,
                        },
                    });

                    setJobId(jobRes.jobId);
                    debugLog('H3', 'pages/CreatePayment.tsx:handleCreateIntent', 'CREATE_JOB_OK', {
                        jobId: jobRes.jobId,
                        intentsCount: Array.isArray(jobRes.intents) ? jobRes.intents.length : null,
                        milestonesCount: Array.isArray(jobRes.milestones) ? jobRes.milestones.length : null,
                    });

                    const q = (jobRes.intents || []).map((intent: any, idx: number) => {
                        const amountStr = String(intent.amount ?? '').split('.')[0];
                        return {
                            milestoneIndex: idx + 1,
                            escrowIntentId: String(intent.id),
                            amountRaw: amountStr,
                            deadlineDays: Number(intent.deadlineDays || days),
                        };
                    });

                    setQueue(q);
                    setLinked([]);

                    if (!q.length) {
                        throw new Error('No milestone intents were created.');
                    }

                    // Kick off the first on-chain creation tx (user will confirm each milestone tx).
                    toast.message(`Creating ${q.length} on-chain escrow intents (one per milestone)…`);
                    startCreateIntentTx(0, q[0].amountRaw, q[0].deadlineDays);
                    return;
                } catch (e: any) {
                    const msg = String(e?.message || e || '');
                    // If jobs tables are not migrated, fall back to a normal escrow intent so user can proceed.
                    if (msg.includes('EscrowJob') || msg.includes('Jobs tables are not migrated') || msg.includes('503')) {
                        toast.message('Jobs DB not ready yet — creating a normal escrow (not published to Explore).');
                    } else {
                        // keep original behavior: fail hard for other job-create errors
                        throw e;
                    }
                }
            }

            const intentIdToUse =
                escrowIntentId ||
                (await createEscrowIntent({
                    recipientId: createdRecipientId,
                    entityType: paymentData.recipient.identity.entityType,
                    amount: rawTotal,
                    fundingAsset: paymentData.amount.fundingAsset,
                    payoutAsset: paymentData.amount.payoutAsset,
                    releaseCondition: paymentData.timing.releaseCondition,
                    deadlineDays: days,
                    acceptanceWindowDays: days,
                    enableYield: Boolean(paymentData.timing.enableYield && effectiveStrategyId && isYieldStrategyAllowed),
                    enableProtection: paymentData.timing.enableProtection,
                    splitConfig: splitBps,
                    milestoneTemplate: paymentData.milestones.items,
                    notes: paymentData.notes,
                })).id;

            if (!escrowIntentId) setEscrowIntentId(intentIdToUse);

            const single = [{ milestoneIndex: 1, escrowIntentId: intentIdToUse, amountRaw: rawTotal, deadlineDays: days }];
            setQueue(single);
            setLinked([]);
            setJobId(null);

            toast.message('Creating on-chain escrow intent…');
            startCreateIntentTx(0, rawTotal, days);
        } catch (error: any) {
            debugLog('H1', 'pages/CreatePayment.tsx:handleCreateIntent', 'CONFIRM_ERROR', {
                message: String(error?.message || error || ''),
            });
            // Allow retry if backend metadata creation failed.
            setConfirmLock(false);
            setCreateError(error?.message || 'Failed to create job / escrow metadata.');
            toast.error('Failed to create job / escrow metadata.');
            return;
        }
    };

    const handlePublishRetry = async () => {
        if (!jobId) return;
        setPublishFailed(false);
        setCreateError(null);
        try {
            await publishJob(jobId);
            toast.success('Job published to Explore.');
            navigate(`/explore/${jobId}`);
        } catch (error: any) {
            const message = 'Job created but failed to publish to Explore.';
            setPublishFailed(true);
            setCreateError(message);
            toast.error(message);
        }
    };

    useEffect(() => {
        if (!isConfirmed) return;

        // Guard: in React 18+ and with receipt revalidation, this effect can fire more than once.
        // Ensure we process each tx hash only once to prevent double linking / double next-tx kickoff.
        if (createTxHash && processedTxHashesRef.current.has(createTxHash)) {
            debugLog('H2', 'pages/CreatePayment.tsx:linkEffect', 'RECEIPT_ALREADY_PROCESSED', {
                createTxHash,
            });
            return;
        }

        debugLog('H2', 'pages/CreatePayment.tsx:linkEffect', 'RECEIPT_CONFIRMED_EFFECT', {
            isConfirmed,
            createTxHash: createTxHash || null,
            receiptLogs: createReceipt?.logs?.length || 0,
            activeIdx,
            queueLen: queue.length,
            linkedLen: linked.length,
        });

        const linkIntent = async () => {
            if (createTxHash) processedTxHashesRef.current.add(createTxHash);
            const idx = activeIdx ?? 0;
            const current = queue[idx];
            if (!current || !createTxHash) return;
            if (!createReceipt?.logs?.length) {
                const message = 'Transaction confirmed, but no escrow event was found.';
                toast.error(message);
                setCreateError(message);
                setConfirmLock(false);
                return;
            }

            let onchainIntentId: bigint | null = null;
            for (const log of createReceipt.logs) {
                try {
                    const decoded = decodeEventLog({
                        abi: escrowCore.abi as Abi,
                        data: log.data,
                        topics: log.topics,
                    });
                    if (decoded.eventName === 'IntentCreated') {
                        onchainIntentId = (decoded as any).args?.intentId as bigint;
                        break;
                    }
                } catch {
                    // Ignore logs that do not match the escrow ABI.
                }
            }

            if (onchainIntentId === null) {
                const message = 'Escrow intent was not found in the transaction logs.';
                toast.error(message);
                setCreateError(message);
                setConfirmLock(false);
                return;
            }

            const payload = {
                onchainIntentId: onchainIntentId.toString(),
                createTxHash,
            };
            let linkedOk = false;
            // Retry link a few times to avoid transient backend delays.
            for (let attempt = 0; attempt < 3; attempt += 1) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    await linkOnchainIntent(current.escrowIntentId, payload);
                    linkedOk = true;
                    break;
                } catch {
                    if (attempt === 2) break;
                    // eslint-disable-next-line no-await-in-loop
                    await new Promise((resolve) => setTimeout(resolve, 750));
                }
            }

            if (!linkedOk) {
                const message = 'Failed to link the on-chain intent. Please try again.';
                toast.error(message);
                setCreateError(message);
                setConfirmLock(false);
                return;
            }

            setLinked((prev) => [
                ...prev,
                {
                    milestoneIndex: current.milestoneIndex,
                    escrowIntentId: current.escrowIntentId,
                    onchainIntentId: onchainIntentId.toString(),
                    txHash: createTxHash,
                },
            ]);

            const nextIdx = idx + 1;
            if (nextIdx < queue.length) {
                const next = queue[nextIdx];
                toast.message(`Milestone ${current.milestoneIndex} linked. Creating milestone ${next.milestoneIndex}…`);
                startCreateIntentTx(nextIdx, next.amountRaw, next.deadlineDays);
                return;
            }

            toast.success('All milestones created and linked.');
            if (jobId) {
                try {
                    await publishJob(jobId);
                    setConfirmLock(false);
                    navigate(`/explore/${jobId}`);
                    return;
                } catch (error: any) {
                    const message = 'Job created but failed to publish to Explore.';
                    setPublishFailed(true);
                    setCreateError(message);
                    setConfirmLock(false);
                    toast.error(message);
                    return;
                }
            }

            setConfirmLock(false);
            navigate('/payments');
        };

        linkIntent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConfirmed, createReceipt, createTxHash]);

    const handleNext = async () => {
        if (currentStep < 5) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        else navigate('/overview');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {currentStep === 1 ? 'Recipient' :
                                currentStep === 2 ? 'Amount' :
                                    currentStep === 3 ? 'Timing & Conditions' :
                                        currentStep === 4 ? 'Split' : 'Review'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {currentStep === 1 ? 'Who are you paying and where should funds go?' :
                                currentStep === 2 ? 'Define the funding and payout assets.' :
                                    currentStep === 3 ? 'Set release conditions, deadlines, and protections.' :
                                        currentStep === 4 ? 'Distribute payouts across recipients.' :
                                            'Confirm details before creating the payment.'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-xs font-mono text-primary">IDRX Treasury</span>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-slate-900 transition-colors">
                        <Settings size={20} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    {/* Stepper Container */}
                    <div className="bg-[#0a0a0a] border border-slate-800 rounded-2xl min-h-[640px] overflow-hidden mb-6 flex flex-col">
                        <div className="p-6 border-b border-slate-800/50">
                            <ReactBitsStepper
                                steps={[
                                    { id: 1, label: 'Recipient' },
                                    { id: 2, label: 'Amount' },
                                    { id: 3, label: 'Timing' },
                                    { id: 4, label: 'Split' },
                                    { id: 5, label: 'Review' }
                                ]}
                                currentStep={currentStep - 1}
                                onStepClick={(index) => setCurrentStep(index + 1)}
                            />
                        </div>

                        <div className="p-6 flex-1">
                            {currentStep === 1 && <Step1Recipient data={paymentData} updateFields={updateData} onEntityTypeChange={applyEntityDefaults} />}
                            {currentStep === 2 && (
                                <Step2Amount
                                    data={paymentData}
                                    updateFields={updateData}
                                    routeRegistryAddress={routeRegistryAddress}
                                    swapFallbackNote={swapFallbackNote}
                                />
                            )}
                            {currentStep === 3 && <Step3Timing data={paymentData} updateFields={updateData} />}
                            {currentStep === 4 && <Step4Split data={paymentData} updateFields={updateData} />}
                            {currentStep === 5 && (
                                <Step5Review
                                    data={paymentData}
                                    error={createError}
                                    jobId={jobId}
                                    queue={queue}
                                    linked={linked}
                                    publishFailed={publishFailed}
                                    onPublishRetry={handlePublishRetry}
                                    isProcessing={isCreating || isConfirming}
                                    network={{
                                        isWrongNetwork: !isOnBaseSepolia,
                                        currentChainId: chainId,
                                        switching: isSwitchingChain,
                                        onSwitch: handleSwitchToBaseSepolia,
                                    }}
                                    swapFallbackNote={swapFallbackNote}
                                    eligibility={[
                                        {
                                            label: 'Wallet connected',
                                            ok: Boolean(address),
                                            hint: 'Connect your wallet to sign the escrow intent.',
                                        },
                                        {
                                            label: 'Base Sepolia network',
                                            ok: isOnBaseSepolia,
                                            hint: 'Switch to Base Sepolia to create the on-chain intent.',
                                        },
                                        {
                                            label: 'Funding token eligible',
                                            ok: isTokenEligible,
                                            hint: 'Choose a funding asset listed in the TokenRegistry.',
                                        },
                                        {
                                            label: 'Payout token eligible',
                                            ok: isPayoutTokenEligible,
                                            hint: 'Choose a payout asset listed in the TokenRegistry.',
                                        },
                                        {
                                            label: 'Swap route valid (if required)',
                                            ok: !swapRequired || isSwapRouteValid,
                                            hint: 'Pick a payout asset with an allowed route (RFQ or fallback).',
                                        },
                                        {
                                            label: 'Split totals 100% (if required)',
                                            ok: !isSplitRequired || isSplitValid,
                                            hint: 'Adjust split percentages so they total 100%.',
                                        },
                                        {
                                            label: 'Form data valid',
                                            ok: isDataValid,
                                            hint: 'Complete all required fields before confirming.',
                                        },
                                    ]}
                                    confirmDisabled={
                                        confirmLock ||
                                        isCreating ||
                                        isConfirming ||
                                        (queue.length > 0 && linked.length >= queue.length)
                                    }
                                    onConfirm={handleCreateIntent}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 gap-4 sm:gap-0">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium w-full sm:w-auto"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>

                        {currentStep < 5 && (
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 rounded-xl font-bold transition-all w-full sm:w-auto bg-primary hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(0,82,255,0.3)] hover:shadow-[0_0_30px_rgba(0,82,255,0.5)]"
                            >
                                Continue
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    {[2, 3].includes(currentStep) ? (
                        <SidebarTreasury amount={paymentData.amount.value} />
                    ) : (
                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-slate-300 tracking-wider uppercase mb-4">
                                {currentStep === 1 ? 'Recipient Guidance' :
                                    currentStep === 4 ? 'Split Guidance' :
                                        'Review Tips'}
                            </h4>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {currentStep === 1 ? 'Ensure the recipient entity and payout address match your contract or invoice.' :
                                        currentStep === 4 ? 'Splits should total 100% to avoid allocation errors.' :
                                            'Confirm assets, timing, and protections before creating the payment.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
