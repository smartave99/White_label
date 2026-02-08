export const dynamic = "force-dynamic";

export default function SimpleDebugPage() {
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold text-blue-600">Simple Debug Page Works</h1>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    );
}
