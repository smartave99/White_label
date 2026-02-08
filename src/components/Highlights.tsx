import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PenTool, Smile, Utensils, Home as HomeIcon, Package, LucideIcon } from "lucide-react";
import { getDepartments } from "@/app/actions";

const iconMap: Record<string, LucideIcon> = {
    PenTool,
    Smile,
    Utensils,
    Home: HomeIcon,
    Package,
};

export default async function Highlights() {
    const departments = await getDepartments();

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
                        Curated for <span className="text-brand-gold">You</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Explore our diverse departments, each offering a unique selection of premium products tailored to your lifestyle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    {departments.map((item) => {
                        const Icon = iconMap[item.icon] || Package;
                        const color = "bg-brand-green/10 text-brand-green"; // Default color or map from ID

                        return (
                            <Link
                                key={item.id}
                                href={`/departments#${item.id}`}
                                className="group relative h-[400px] overflow-hidden rounded-2xl shadow-lg cursor-pointer block"
                            >
                                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />

                                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                                    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-4 shadow-lg`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-300 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center text-brand-gold text-sm font-semibold gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                        Shop Now <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
