import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Loader2, Globe, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { userProfileSchema, UserProfileFormValues } from '../../lib/validators';
import { mockUserApi } from '../../lib/mock-api';

const SettingsProfile: React.FC = () => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { isSubmitting, isDirty, errors }
    } = useForm({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            displayName: '',
            bio: '',
            skills: '',
            portfolioUrl: '',
            emailNotifications: true
        }
    });

    const [previewUrl, setPreviewUrl] = React.useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
                setValue('avatarUrl', result, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };

    // Fetch initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await mockUserApi.getProfile();
                setValue('displayName', data.displayName);
                setValue('bio', data.bio || '');
                setValue('skills', data.skills || '');
                setValue('portfolioUrl', data.portfolioUrl || '');
                setValue('avatarUrl', data.avatarUrl || '');
                setPreviewUrl(data.avatarUrl || '');
                setValue('emailNotifications', data.emailNotifications);
            } catch (error) {
                toast.error("Failed to load profile data");
            }
        };
        loadData();
    }, [setValue]);

    const onSubmit = async (data: UserProfileFormValues) => {
        try {
            await mockUserApi.updateProfile(data);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-2xl font-black text-white mb-1">Public Profile</h2>
                <p className="text-slate-400 text-sm">This information will be displayed on your public entity profile.</p>
            </div>

            <div className="space-y-8">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-xl group-hover:border-blue-500 transition-colors">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                    <span className="text-3xl font-bold">?</span>
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                            <span className="text-xs font-bold text-white">Change</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Profile Photo</h3>
                        <p className="text-slate-500 text-xs mt-1 mb-3">Recommended 400x400px.</p>
                        <div className="flex gap-3">
                            <label className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                                Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewUrl('');
                                        setValue('avatarUrl', '');
                                    }}
                                    className="px-4 py-2 text-red-400 text-xs font-bold hover:text-red-300"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Name</label>
                    <input
                        {...register('displayName')}
                        className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${errors.displayName ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                            }`}
                        placeholder="e.g. Satoshi Nakamoto"
                    />
                    {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio</label>
                    <textarea
                        {...register('bio')}
                        rows={4}
                        className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 resize-none ${errors.bio ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                            }`}
                        placeholder="Tell us about your expertise..."
                    />
                    {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
                </div>

                {/* Skills */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase size={14} className="text-purple-500" />
                        Skills (Comma Separated)
                    </label>
                    <input
                        {...register('skills')}
                        className="w-full bg-[#0a0a0a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                        placeholder="React, Solidity, Design..."
                    />
                    <p className="text-[10px] text-slate-500">* These will appear as tags on your profile.</p>
                </div>

                {/* Portfolio URL */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Globe size={14} className="text-emerald-500" />
                        Portfolio URL
                    </label>
                    <input
                        {...register('portfolioUrl')}
                        type="url"
                        className={`w-full bg-black/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${errors.portfolioUrl ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                            }`}
                        placeholder="https://your-portfolio.com"
                    />
                    {errors.portfolioUrl && <p className="text-red-500 text-xs mt-1">{errors.portfolioUrl.message}</p>}
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className={`
                        flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all
                        ${isSubmitting ? 'bg-slate-800 text-slate-400 cursor-not-allowed' :
                            isDirty ? 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/20 hover:scale-[1.02]' : 'bg-slate-800 text-slate-500'}
                    `}
                >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default SettingsProfile;
