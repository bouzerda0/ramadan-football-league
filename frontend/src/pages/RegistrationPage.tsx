
import Navigation from '@/components/Navigation';
// import { useLanguage } from '@/context/LanguageContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Users, User, Phone, Mail, Trophy, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Form Schema
const formSchema = z.object({
    teamName: z.string().min(3, "Team name must be at least 3 characters"),
    captainName: z.string().min(3, "Captain name must be at least 3 characters"),
    captainEmail: z.string().email("Invalid email address"),
    captainPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    players: z.array(z.object({
        name: z.string().min(3, "Player name must be at least 3 characters")
    })).min(5, "At least 5 players are required").max(10, "Maximum 10 players allowed"),
});

type FormData = z.infer<typeof formSchema>;

export default function RegistrationPage() {
    // const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamName: "",
            captainName: "",
            captainEmail: "",
            captainPhone: "",
            players: Array(6).fill({ name: "" }) // Default 6 players
        }
    });

    // Watch players to render inputs
    // Ideally useFieldArray, but simplified for now:
    // Let's just hardcode 8 player inputs for simplicity or map
    // For proper dynamic fields, useFieldArray is better but let's stick to simple mapping for now
    // We'll manage players state locally for dynamic addition/removal if needed, 
    // or just render a fixed list. The prompt said "list of players".
    // Let's go with fixed 8 slots for a 5-a-side + subs team.

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("teamName", data.teamName);
            formData.append("captainName", data.captainName);
            formData.append("captainEmail", data.captainEmail);
            formData.append("captainPhone", data.captainPhone);
            formData.append("players", JSON.stringify(data.players));

            if (logoFile) {
                formData.append("logo", logoFile);
            }

            const response = await fetch("/api/register", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Registration successful!");
                navigate("/");
            } else {
                alert("Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1C] text-[#F4F6FA] pb-20">
            <Navigation />

            <div className="max-w-4xl mx-auto px-4 pt-32">
                <Link to="/" className="inline-flex items-center gap-2 text-[#A9B3C7] hover:text-[#D4A018] mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-[#F4F6FA] mb-4">
                        <span className="text-[#D4A018]">Team</span> Registration
                    </h1>
                    <p className="text-[#A9B3C7]">Register your team for the Zone 01 Ramadan League 2026</p>
                </div>

                <div className="bg-[#141B2D]/50 border border-[#D4A018]/20 rounded-2xl p-6 md:p-10 backdrop-blur-sm">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Team Details */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-[#D4A018]">
                                <Trophy size={20} /> Team Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="teamName">Team Name</Label>
                                    <div className="relative">
                                        <Input
                                            {...register("teamName")}
                                            id="teamName"
                                            className="bg-[#0B0F1C] border-[#D4A018]/20 focus:border-[#D4A018] text-white pl-10"
                                            placeholder="e.g. The Eagles"
                                        />
                                        <Users className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    </div>
                                    {errors.teamName && <p className="text-red-500 text-sm">{errors.teamName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Team Logo (Optional)</Label>
                                    <div className="border border-dashed border-[#D4A018]/30 rounded-lg p-6 flex flex-col items-center justify-center bg-[#0B0F1C]/50 hover:bg-[#0B0F1C] transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            id="logo"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                        />
                                        <Upload className="w-8 h-8 text-[#D4A018] mb-2" />
                                        <span className="text-sm text-[#A9B3C7]">
                                            {logoFile ? logoFile.name : "Click to upload logo"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Captain Info */}
                        <div className="space-y-6 pt-6 border-t border-[#D4A018]/10">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-[#D4A018]">
                                <User size={20} /> Captain Information
                            </h3>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="captainName">Full Name</Label>
                                    <div className="relative">
                                        <Input
                                            {...register("captainName")}
                                            className="bg-[#0B0F1C] border-[#D4A018]/20 focus:border-[#D4A018] text-white pl-10"
                                            placeholder="Captain's Name"
                                        />
                                        <User className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    </div>
                                    {errors.captainName && <p className="text-red-500 text-sm">{errors.captainName.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="captainEmail">Email</Label>
                                    <div className="relative">
                                        <Input
                                            {...register("captainEmail")}
                                            type="email"
                                            className="bg-[#0B0F1C] border-[#D4A018]/20 focus:border-[#D4A018] text-white pl-10"
                                            placeholder="email@example.com"
                                        />
                                        <Mail className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    </div>
                                    {errors.captainEmail && <p className="text-red-500 text-sm">{errors.captainEmail.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="captainPhone">Phone Number</Label>
                                    <div className="relative">
                                        <Input
                                            {...register("captainPhone")}
                                            className="bg-[#0B0F1C] border-[#D4A018]/20 focus:border-[#D4A018] text-white pl-10"
                                            placeholder="+212 6..."
                                        />
                                        <Phone className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    </div>
                                    {errors.captainPhone && <p className="text-red-500 text-sm">{errors.captainPhone.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Squad List */}
                        <div className="space-y-6 pt-6 border-t border-[#D4A018]/10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold flex items-center gap-2 text-[#D4A018]">
                                    <Users size={20} /> Squad List
                                </h3>
                                <span className="text-sm text-[#6B7280]">Min 5, Max 10 players</span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-[#D4A018]/20 text-[#D4A018] flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <Input
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            {...register(`players.${index}.name` as any)}
                                            className="bg-[#0B0F1C] border-[#D4A018]/20 focus:border-[#D4A018] text-white"
                                            placeholder={`Player ${index + 1} Name ${index === 0 ? '(Captain)' : ''}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            {errors.players && <p className="text-red-500 text-sm">{errors.players.message || "Please check player details"}</p>}
                        </div>

                        {/* Submit */}
                        <div className="pt-8 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#D4A018] hover:bg-[#E5B829] text-[#0B0F1C] font-bold px-8 py-6 rounded-xl text-lg w-full md:w-auto"
                            >
                                {isSubmitting ? "Registering..." : "Submit Registration"}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
