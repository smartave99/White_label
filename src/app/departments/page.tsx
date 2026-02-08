import { getDepartments } from "@/app/actions";
import DepartmentsGrid from "@/components/DepartmentsGrid";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
    const departments = await getDepartments();

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 md:px-6">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-4">
                        Explore Our <span className="text-brand-gold">Departments</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Discover a world of premium products across our specialized retail zones.
                    </p>
                </div>
                <DepartmentsGrid departments={departments} />
            </div>
        </div>
    );
}
