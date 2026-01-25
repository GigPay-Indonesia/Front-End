import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { parseUnits } from 'viem';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import ReactBitsStepper from '../components/ReactBitsStepper';
import { Step1Recipient } from '../components/create-payment/Step1Recipient';
import { Step2Amount } from '../components/create-payment/Step2Amount';
import { Step3Timing } from '../components/create-payment/Step3Timing';
import { Step4Split } from '../components/create-payment/Step4Split';
import { Step5Review } from '../components/create-payment/Step5Review';
import { SidebarTreasury } from '../components/create-payment/SidebarTreasury';
import { getTokenAddress } from '../lib/abis';
import { useGigPayRegistry } from '../lib/hooks/useGigPayRegistry';
import { useEscrowCoreContract, useTreasuryVaultContract, useTokenRegistryContract } from '../lib/hooks/useGigPayContracts';

export interface PaymentData {
    recipient: {
        name: string;
        type: string;
        email: string;
        payoutAddress: string;
        preferredAsset: string;
    };
    amount: {
        value: string;
        fundingAsset: string;
        payoutAsset: string;
    };
    timing: {
        releaseCondition: string;
        deadline: string;
        enableYield: boolean;
        enableProtection: boolean;
    };
    split: {
        recipients: Array<{ id: number; name: string; address: string; percentage: number }>;
    };
    notes: string;
}

const INITIAL_DATA: PaymentData = {
    recipient: {
        name: 'Nusa Creative Studio',
        type: 'Vendor',
        email: 'finance@nusa.studio',
        payoutAddress: '0x71c7656EC7ab88b098deFB751B7401B5f6d8976F',
        preferredAsset: 'IDRX',
    },
    amount: {
        value: '45.000.000',
        fundingAsset: 'IDRX',
        payoutAsset: 'IDRX',
    },
    timing: {
        releaseCondition: 'On approval',
        deadline: '7 Days',
        enableYield: true,
        enableProtection: false,
    },
    split: {
        recipients: [{ id: 1, name: 'Primary Recipient', address: '0x71c7656EC7ab88b098deFB751B7401B5f6d8976F', percentage: 100 }],
    },
    notes: '',
};

export const CreatePayment: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { address } = useAccount();
    const [currentStep, setCurrentStep] = useState(1);
    const [paymentData, setPaymentData] = useState<PaymentData>(INITIAL_DATA);
    const { tokenRegistryAddress } = useGigPayRegistry();
    const escrowCore = useEscrowCoreContract();
    const treasuryVault = useTreasuryVaultContract();
    const tokenRegistry = useTokenRegistryContract();
    const { writeContract, data: createTxHash, isPending: isCreating } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: createTxHash,
    });

    const updateData = (field: keyof PaymentData, value: any) => {
        setPaymentData(prev => ({ ...prev, [field]: value }));
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
            updated[0] = { ...updated[0], address: prev.recipient.payoutAddress };
            return { ...prev, split: { recipients: updated } };
        });
    }, [paymentData.recipient.payoutAddress]);

    const fundingAssetAddress = useMemo(() => getTokenAddress(paymentData.amount.fundingAsset), [paymentData.amount.fundingAsset]);
    const payoutAssetAddress = useMemo(() => getTokenAddress(paymentData.amount.payoutAsset), [paymentData.amount.payoutAsset]);

    const tokenConfig = useReadContract({
        address: (tokenRegistryAddress || tokenRegistry.address) as `0x${string}` | undefined,
        abi: tokenRegistry.abi,
        functionName: 'tokenConfig',
        args: fundingAssetAddress ? [fundingAssetAddress] : undefined,
        query: { enabled: Boolean((tokenRegistryAddress || tokenRegistry.address) && tokenRegistry.abi && fundingAssetAddress) },
    });

    const isEscrowEligible = useReadContract({
        address: (tokenRegistryAddress || tokenRegistry.address) as `0x${string}` | undefined,
        abi: tokenRegistry.abi,
        functionName: 'isEscrowEligible',
        args: fundingAssetAddress ? [fundingAssetAddress] : undefined,
        query: { enabled: Boolean((tokenRegistryAddress || tokenRegistry.address) && tokenRegistry.abi && fundingAssetAddress) },
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
            recipient: recipient.address || paymentData.recipient.payoutAddress,
            bps: Math.round(recipient.percentage * 100),
        }));
    }, [paymentData.split.recipients, paymentData.recipient.payoutAddress]);

    const totalBps = useMemo(() => splitBps.reduce((sum, split) => sum + split.bps, 0), [splitBps]);
    const isSplitValid = totalBps === 10000;
    const isTokenEligible = isEscrowEligible.data !== false;

    const parseDays = (value: string) => {
        const numeric = Number(value.replace(/[^0-9]/g, ''));
        return Number.isNaN(numeric) || numeric <= 0 ? 0 : numeric;
    };

    const handleCreateIntent = () => {
        if (!escrowCore.address || !escrowCore.abi || !treasuryVault.address) return;
        if (!fundingAssetAddress || parsedAmount === 0n) return;
        if (!isSplitValid || !isTokenEligible) return;

        const days = parseDays(paymentData.timing.deadline);
        const now = Math.floor(Date.now() / 1000);
        const deadline = BigInt(now + days * 86400);
        const acceptanceWindow = BigInt(days * 86400);
        const escrowYieldEnabled = Boolean(paymentData.timing.enableYield);
        const escrowStrategyId = 0;
        const usePayout = payoutAssetAddress && payoutAssetAddress !== fundingAssetAddress;

        if (usePayout) {
            writeContract({
                address: escrowCore.address,
                abi: escrowCore.abi,
                functionName: 'createIntentFromTreasuryWithPayout',
                args: [
                    treasuryVault.address,
                    fundingAssetAddress,
                    payoutAssetAddress,
                    parsedAmount,
                    deadline,
                    acceptanceWindow,
                    splitBps,
                    escrowYieldEnabled,
                    escrowStrategyId,
                    0,
                ],
            });
            return;
        }

        writeContract({
            address: escrowCore.address,
            abi: escrowCore.abi,
            functionName: 'createIntentFromTreasury',
            args: [
                treasuryVault.address,
                fundingAssetAddress,
                parsedAmount,
                deadline,
                acceptanceWindow,
                splitBps,
                escrowYieldEnabled,
                escrowStrategyId,
            ],
        });
    };

    useEffect(() => {
        if (isConfirmed) {
            navigate('/payments');
        }
    }, [isConfirmed, navigate]);

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleCreateIntent();
        }
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
                            {currentStep === 1 && <Step1Recipient data={paymentData} updateFields={updateData} />}
                            {currentStep === 2 && <Step2Amount amount={paymentData.amount} updateAmount={(a) => updateData('amount', a)} />}
                            {currentStep === 3 && <Step3Timing timing={paymentData.timing} updateTiming={(t) => updateData('timing', t)} />}
                            {currentStep === 4 && <Step4Split split={paymentData.split} updateSplit={(s) => updateData('split', s)} />}
                            {currentStep === 5 && <Step5Review data={paymentData} />}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between pt-4 gap-4 sm:gap-0">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium w-full sm:w-auto"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={currentStep === 5 && (!address || !isSplitValid || !isTokenEligible || isCreating || isConfirming)}
                            className={`px-8 py-3 rounded-xl font-bold transition-all w-full sm:w-auto ${currentStep === 5
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                                : 'bg-primary hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(0,82,255,0.3)] hover:shadow-[0_0_30px_rgba(0,82,255,0.5)]'
                                }`}
                        >
                            {currentStep === 5
                                ? isCreating || isConfirming
                                    ? 'Processing...'
                                    : 'Confirm'
                                : 'Continue'}
                        </button>
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
