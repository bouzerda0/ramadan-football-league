import { Link } from 'react-router-dom';
import { Users, Calendar, User, Settings, TrendingUp, Trophy } from 'lucide-react';

export default function AdminDashboard() {
    const cards = [
        {
            to: '/admin/teams',
            icon: Users,
            title: 'Manage Teams',
            description: 'Create, edit, and delete teams. Manage players and team statistics.',
            color: 'from-blue-500/20 to-blue-600/10',
            borderColor: 'border-blue-500/30',
        },
        {
            to: '/admin/matches',
            icon: Calendar,
            title: 'Manage Matches',
            description: 'Schedule matches, update scores, add events and select MVP.',
            color: 'from-green-500/20 to-green-600/10',
            borderColor: 'border-green-500/30',
        },
        {
            to: '/admin/players',
            icon: User,
            title: 'Manage Players',
            description: 'View and edit player statistics. Top scorers and assists.',
            color: 'from-purple-500/20 to-purple-600/10',
            borderColor: 'border-purple-500/30',
        },
        {
            to: '/admin/settings',
            icon: Settings,
            title: 'Website Settings',
            description: 'Configure titles, prayer times, weather, and logo.',
            color: 'from-orange-500/20 to-orange-600/10',
            borderColor: 'border-orange-500/30',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-[#D4A018]/20 to-[#D4A018]/5 p-6 rounded-xl border border-[#D4A018]/20">
                <h2 className="text-2xl font-bold mb-2">Welcome to Admin Panel</h2>
                <p className="text-[#A9B3C7]">
                    Manage your Ramadan Football League from here. Use the cards below to navigate to different sections.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10 text-center">
                    <Trophy className="w-8 h-8 text-[#D4A018] mx-auto mb-2" />
                    <p className="text-[#A9B3C7] text-sm">Tournament</p>
                    <p className="text-xl font-bold">RFL 2026</p>
                </div>
                <div className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10 text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-[#A9B3C7] text-sm">Teams</p>
                    <p className="text-xl font-bold">Manage</p>
                </div>
                <div className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10 text-center">
                    <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-[#A9B3C7] text-sm">Matches</p>
                    <p className="text-xl font-bold">Schedule</p>
                </div>
                <div className="bg-[#141B2D] p-4 rounded-xl border border-[#D4A018]/10 text-center">
                    <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-[#A9B3C7] text-sm">Stats</p>
                    <p className="text-xl font-bold">Track</p>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.to}
                        to={card.to}
                        className={`group p-6 bg-gradient-to-br ${card.color} border ${card.borderColor} rounded-xl hover:scale-[1.02] transition-all duration-300`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-[#0B0F1C]/50 flex items-center justify-center group-hover:bg-[#0B0F1C] transition-colors">
                                <card.icon className="w-7 h-7 text-[#D4A018]" />
                            </div>
                            <h2 className="text-xl font-bold">{card.title}</h2>
                        </div>
                        <p className="text-[#A9B3C7]">{card.description}</p>
                    </Link>
                ))}
            </div>

            {/* Tips */}
            <div className="bg-[#141B2D] p-6 rounded-xl border border-[#D4A018]/10">
                <h3 className="font-bold text-[#D4A018] mb-3">Quick Tips</h3>
                <ul className="space-y-2 text-[#A9B3C7] text-sm">
                    <li>• Start by adding teams in the "Manage Teams" section</li>
                    <li>• Schedule matches after teams are created</li>
                    <li>• Update match scores and events in real-time during games</li>
                    <li>• Configure prayer times and weather in Settings</li>
                    <li>• Player statistics are automatically calculated from match events</li>
                </ul>
            </div>
        </div>
    );
}
