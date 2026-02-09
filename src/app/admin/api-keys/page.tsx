"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
    getAPIKeys,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    testAPIKey,
    getAPIKeyManagerHealth,
    StoredAPIKey
} from "@/app/api-key-actions";
import {
    Loader2,
    ArrowLeft,
    Plus,
    Trash2,
    Key,
    Save,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Eye,
    EyeOff,
    Zap,
    Shield
} from "lucide-react";
import Link from "next/link";

export default function APIKeyManager() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [keys, setKeys] = useState<StoredAPIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showKeyValue, setShowKeyValue] = useState<Record<string, boolean>>({});
    const [healthStatus, setHealthStatus] = useState<{
        totalKeys: number;
        activeKeyIndex: number;
        keys: Array<{
            index: number;
            maskedKey: string;
            callCount: number;
            isActive: boolean;
            isHealthy: boolean;
            rateLimited: boolean;
            cooldownRemaining: number | null;
        }>;
    } | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        key: "",
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/admin/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [keysData, health] = await Promise.all([
                getAPIKeys(),
                getAPIKeyManagerHealth()
            ]);
            setKeys(keysData);
            setHealthStatus(health);
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    const handleAddKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const result = await addAPIKey(formData.name, formData.key);
        if (result.success) {
            setFormData({ name: "", key: "" });
            setShowAddForm(false);
            await loadData();
        } else {
            alert(result.error || "Failed to add API key");
        }

        setSaving(false);
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        const result = await updateAPIKey(id, { isActive: !currentActive });
        if (result.success) {
            await loadData();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this API key?")) {
            const result = await deleteAPIKey(id);
            if (result.success) {
                await loadData();
            }
        }
    };

    const handleTestKey = async (id: string) => {
        setTestingKeyId(id);
        const result = await testAPIKey(id, true);
        if (!result.success) {
            alert(result.error || "Test failed");
        }
        await loadData();
        setTestingKeyId(null);
    };

    const toggleShowKey = (id: string) => {
        setShowKeyValue(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">AI Assistant API Keys</h1>
                        <p className="text-gray-500">Manage Gemini API keys for the product recommendation assistant</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Key
                    </button>
                </div>

                {/* Health Status Card */}
                {healthStatus && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-gray-800">Key Manager Health</h3>
                            <button
                                onClick={loadData}
                                className="ml-auto p-1 hover:bg-gray-100 rounded"
                                title="Refresh"
                            >
                                <RefreshCw className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-gray-500">Total Keys</div>
                                <div className="text-xl font-bold text-gray-800">{healthStatus.totalKeys}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-gray-500">Active Key</div>
                                <div className="text-xl font-bold text-gray-800">#{healthStatus.activeKeyIndex + 1}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-gray-500">Healthy</div>
                                <div className="text-xl font-bold text-green-600">
                                    {healthStatus.keys.filter(k => k.isHealthy).length}
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-gray-500">Total Calls</div>
                                <div className="text-xl font-bold text-gray-800">
                                    {healthStatus.keys.reduce((sum, k) => sum + k.callCount, 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Key Form */}
                {showAddForm && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Add New API Key</h3>
                            <button onClick={() => setShowAddForm(false)}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleAddKey} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Key Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Primary Key, Backup Key, etc."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gemini API Key *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.key}
                                        onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                        placeholder="AIzaSy..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Add Key
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Keys List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Stored API Keys ({keys.length})</h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No API keys configured.</p>
                            <p className="text-sm mt-1">Add a Gemini API key to enable the AI assistant.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {keys.map((keyItem) => (
                                <div key={keyItem.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${keyItem.isActive
                                                ? keyItem.isValid === true
                                                    ? 'bg-green-100'
                                                    : keyItem.isValid === false
                                                        ? 'bg-red-100'
                                                        : 'bg-amber-100'
                                                : 'bg-gray-100'
                                            }`}>
                                            <Key className={`w-5 h-5 ${keyItem.isActive
                                                    ? keyItem.isValid === true
                                                        ? 'text-green-600'
                                                        : keyItem.isValid === false
                                                            ? 'text-red-600'
                                                            : 'text-amber-600'
                                                    : 'text-gray-400'
                                                }`} />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-800 truncate">{keyItem.name}</h4>
                                            {!keyItem.isActive && (
                                                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                                                    Disabled
                                                </span>
                                            )}
                                            {keyItem.isValid === true && (
                                                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Valid
                                                </span>
                                            )}
                                            {keyItem.isValid === false && (
                                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> Invalid
                                                </span>
                                            )}
                                            {keyItem.isValid === null && keyItem.isActive && (
                                                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-600 rounded flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Untested
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm text-gray-500 font-mono">
                                                {showKeyValue[keyItem.id] ? keyItem.key : keyItem.maskedKey}
                                            </code>
                                            <button
                                                onClick={() => toggleShowKey(keyItem.id)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                {showKeyValue[keyItem.id] ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {keyItem.lastTested && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Last tested: {new Date(keyItem.lastTested).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTestKey(keyItem.id)}
                                            disabled={testingKeyId === keyItem.id}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Test Key"
                                        >
                                            {testingKeyId === keyItem.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Zap className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(keyItem.id, keyItem.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${keyItem.isActive
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-400 hover:bg-gray-100'
                                                }`}
                                            title={keyItem.isActive ? "Disable" : "Enable"}
                                        >
                                            {keyItem.isActive ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <XCircle className="w-5 h-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(keyItem.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Add multiple API keys for redundancy. The system will automatically
                    rotate to backup keys if the primary key gets rate-limited or encounters errors.
                </div>
            </div>
        </div>
    );
}
