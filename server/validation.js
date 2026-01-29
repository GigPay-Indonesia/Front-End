import { z } from 'zod';

const entityType = z.enum(['VENDOR', 'PARTNER', 'AGENCY', 'CONTRACTOR']);
const payoutMethod = z.enum(['ONCHAIN', 'BANK', 'HYBRID']);
const settlementPreference = z.enum(['INSTANT', 'WEEKLY', 'MONTHLY']);
const riskTier = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const approvalPolicy = z.enum(['AUTO', 'SINGLE', 'MULTI', 'THRESHOLD']);

const identitySchema = z.object({
    displayName: z.string().min(1),
    legalName: z.string().optional(),
    entityType,
    email: z.string().email(),
    country: z.string().min(1),
    timezone: z.string().min(1),
    referenceId: z.string().optional(),
    orgId: z.string().optional(),
});

const payoutSchema = z.object({
    preferredAsset: z.string().min(1),
    payoutMethod,
    payoutAddress: z.string().optional(),
    bankAccountRef: z.string().optional(),
    settlementPreference,
});

const accountingSchema = z.object({
    counterpartyCode: z.string().optional(),
    costCenter: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

const policySchema = z.object({
    riskTier,
    approvalPolicy,
    maxSinglePayment: z.string().optional(),
    maxMonthlyLimit: z.string().optional(),
    requiresEscrowDefault: z.boolean().optional(),
    requiresMilestonesDefault: z.boolean().optional(),
});

const vendorProfileSchema = z.object({
    type: z.literal('VENDOR'),
    vendorCategory: z.enum(['SOFTWARE', 'HARDWARE', 'SERVICES', 'LOGISTICS', 'MARKETING', 'OTHER']),
    paymentTerms: z.enum(['NET0', 'NET7', 'NET14', 'NET30', 'MILESTONE_BASED']),
    invoiceRequired: z.boolean(),
    invoiceEmail: z.preprocess(
        (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
        z.string().email().optional()
    ),
    supportedDocuments: z.array(z.enum(['Invoice', 'PO', 'DeliveryProof'])).optional(),
    billToEntityName: z.string().optional(),
    taxTreatment: z.string().optional(),
}).refine((data) => !data.invoiceRequired || Boolean(data.invoiceEmail), {
    message: 'Invoice email required when invoiceRequired is true.',
    path: ['invoiceEmail'],
});

const partnerProfileSchema = z.object({
    type: z.literal('PARTNER'),
    partnerModel: z.enum(['REVENUE_SHARE', 'PROFIT_SHARE', 'COST_SHARE', 'AFFILIATE', 'REFERRAL']),
    settlementCycle: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'PER_CAMPAIGN']),
    defaultSplitBps: z.number().int().optional(),
    programId: z.string().optional(),
    trackingMethod: z.enum(['OFFCHAIN_REPORT', 'ONCHAIN_METRICS', 'MANUAL_APPROVAL']),
    kpiTags: z.array(z.string()).optional(),
});

const agencyProfileSchema = z.object({
    type: z.literal('AGENCY'),
    payoutMode: z.enum(['MASTER_PAYEE', 'SPLIT_TO_TEAM', 'HYBRID']),
    hasSubRecipients: z.boolean(),
    acceptanceWindowDefault: z.number().int().optional(),
    requiresMilestones: z.boolean(),
    milestoneTemplate: z.any().optional(),
});

const contractorProfileSchema = z.object({
    type: z.literal('CONTRACTOR'),
    engagementType: z.enum(['FIXED', 'HOURLY', 'RETAINER']),
    scopeSummary: z.string().min(1),
    preferredPayoutAsset: z.string().min(1),
    kycLevel: z.enum(['NONE', 'BASIC', 'VERIFIED']),
    disputePreference: z.enum(['AUTO_ARBITRATION', 'MANUAL_REVIEW']),
});

const profileSchema = z.union([
    vendorProfileSchema,
    partnerProfileSchema,
    agencyProfileSchema,
    contractorProfileSchema,
]);

const splitTemplate = z.object({
    templateName: z.string().min(1),
    recipientWalletOrRef: z.string().min(1),
    bps: z.number().int().min(0).max(10000),
});

const splitConfigSchema = z.array(z.object({
    recipient: z.string().min(1),
    bps: z.number().int().min(0).max(10000),
})).superRefine((splits, ctx) => {
    const total = splits.reduce((sum, split) => sum + split.bps, 0);
    if (total !== 10000) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Split bps must sum to 10000.',
        });
    }
});

export const splitTemplateSchema = z.object({
    templates: z.array(splitTemplate),
});

export const recipientSchema = z.object({
    identity: identitySchema,
    payout: payoutSchema,
    accounting: accountingSchema,
    policy: policySchema,
    profile: profileSchema,
    splitTemplates: z.array(splitTemplate).optional(),
}).refine((data) => data.identity.entityType === data.profile.type, {
    message: 'Profile type must match entityType.',
    path: ['profile'],
});

export const recipientUpdateSchema = z.object({
    identity: identitySchema.partial().optional(),
    payout: payoutSchema.partial().optional(),
    accounting: accountingSchema.partial().optional(),
    policy: policySchema.partial().optional(),
});

export const prepareIntentSchema = z.object({
    recipientId: z.string().uuid(),
});

export const escrowIntentSchema = z.object({
    recipientId: z.string().uuid(),
    entityType,
    amount: z.string().min(1),
    fundingAsset: z.string().min(1),
    payoutAsset: z.string().min(1),
    releaseCondition: z.enum(['ON_APPROVAL', 'ON_DELIVERY', 'ON_MILESTONE']),
    deadlineDays: z.number().int().positive(),
    acceptanceWindowDays: z.number().int().positive(),
    enableYield: z.boolean(),
    enableProtection: z.boolean(),
    splitConfig: splitConfigSchema.optional(),
    milestoneTemplate: z.any().optional(),
    notes: z.string().optional(),
});

export const escrowOnchainLinkSchema = z.object({
    onchainIntentId: z.union([z.string(), z.number(), z.bigint()]),
    createTxHash: z.string().optional(),
});

export const escrowActionSchema = z.object({
    txHash: z.string().optional(),
    evidenceHash: z.string().optional(),
});

// --- Public Jobs (Explore) ---
// A Job groups multiple EscrowIntents (one per milestone).
export const jobCreateSchema = z.object({
    createdBy: z.string().min(1),
    job: z.object({
        isPublic: z.boolean().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
    }),
    payment: z.object({
        recipientId: z.string().uuid(),
        entityType,
        amount: z.string().min(1),
        fundingAsset: z.string().min(1),
        payoutAsset: z.string().min(1),
        releaseCondition: z.enum(['ON_APPROVAL', 'ON_DELIVERY', 'ON_MILESTONE']),
        deadlineDays: z.number().int().positive(),
        acceptanceWindowDays: z.number().int().positive(),
        enableYield: z.boolean(),
        enableProtection: z.boolean(),
        splitConfig: splitConfigSchema.optional(),
        // Expect the UI's `PaymentData.milestones.items` (ids optional).
        milestones: z
            .array(
                z.object({
                    title: z.string().min(1),
                    dueDays: z.string().optional(),
                    percentage: z.number().min(0).max(100),
                })
            )
            .optional(),
        notes: z.string().optional(),
    }),
});

export const jobJoinSchema = z.object({
    address: z.string().min(1),
});
