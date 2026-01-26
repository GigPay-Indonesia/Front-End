import { z } from 'zod';

export const userProfileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters").max(50),
    bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
    skills: z.string().optional(), // We'll keep it simple as comma-separated string for now
    portfolioUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    avatarUrl: z.string().optional(),
    emailNotifications: z.boolean().default(true),
});

export type UserProfileFormValues = z.infer<typeof userProfileSchema>;
