
import { Link } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Link to="/admin/teams" className="group p-6 bg-[#141B2D] border border-[#D4A018]/10 rounded-xl hover:border-[#D4A018]/50 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#D4A018]/10 flex items-center justify-center group-hover:bg-[#D4A018] transition-colors">
                        <Users className="w-6 h-6 text-[#D4A018] group-hover:text-[#0B0F1C]" />
                    </div>
                    <h2 className="text-xl font-bold">Manage Teams</h2>
                </div>
                <p className="text-[#A9B3C7]">View, edit, or delete registered teams.</p>
            </Link>

            <Link to="/admin/matches" className="group p-6 bg-[#141B2D] border border-[#D4A018]/10 rounded-xl hover:border-[#D4A018]/50 transition-all">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#D4A018]/10 flex items-center justify-center group-hover:bg-[#D4A018] transition-colors">
                        <Calendar className="w-6 h-6 text-[#D4A018] group-hover:text-[#0B0F1C]" />
                    </div>
                    <h2 className="text-xl font-bold">Manage Matches</h2>
                </div>
                <p className="text-[#A9B3C7]">Schedule matches and update live scores.</p>
            </Link>
        </div>
    );
}
