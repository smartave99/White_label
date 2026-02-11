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
    Shield,
    Bot,
    Sparkles,
    Brain
} from "lucide-react";
import { LLMProvider, APIKeyManagerStatus } from "@/types/assistant-types";
import Link from "next/link";

export default function APIKeyManager() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const [keys, setKeys] = useState<StoredAPIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showKeyValue, setShowKeyValue] = useState<Record<string, boolean>>({});
    const [healthStatus, setHealthStatus] = useState<APIKeyManagerStatus | null>(null);

    const [formData, setFormData] = useState<{
        name: string;
        key: string;
        provider: LLMProvider;
    }>({
        name: "",
        key: "",
        provider: "google",
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/admin/login");
            } else if (role !== "Admin") {
                router.push("/admin");
            }
        }
    }, [authLoading, user, role, router]);

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

        const result = await addAPIKey(formData.name, formData.key, formData.provider);
        if (result.success) {
            setFormData({ name: "", key: "", provider: "google" });
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Provider
                                    </label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.provider === 'google' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="provider"
                                                value="google"
                                                checked={formData.provider === 'google'}
                                                onChange={() => setFormData({ ...formData, provider: 'google' })}
                                                className="hidden"
                                            />
                                            <Sparkles className="w-5 h-5" />
                                            <span className="font-medium">Google Gemini</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.provider === 'openai' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="provider"
                                                value="openai"
                                                checked={formData.provider === 'openai'}
                                                onChange={() => setFormData({ ...formData, provider: 'openai' })}
                                                className="hidden"
                                            />
                                            <Bot className="w-5 h-5" />
                                            <span className="font-medium">OpenAI</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.provider === 'anthropic' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="provider"
                                                value="anthropic"
                                                checked={formData.provider === 'anthropic'}
                                                onChange={() => setFormData({ ...formData, provider: 'anthropic' })}
                                                className="hidden"
                                            />
                                            <Brain className="w-5 h-5" />
                                            <span className="font-medium">Anthropic</span>
                                        </label>
                                    </div>
                                </div>
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
                                        API Key *
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
                            {keys.map((keyItem) => {
                                const health = healthStatus?.keys.find(k => k.id === keyItem.id);
                                return (
                                    <div key={keyItem.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex-shrink-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${keyItem.isActive
                                                ? health?.rateLimited
                                                    ? 'bg-amber-100'
                                                    : keyItem.isValid === true
                                                        ? 'bg-green-100'
                                                        : keyItem.isValid === false
                                                            ? 'bg-red-100'
                                                            : 'bg-amber-100'
                                                : 'bg-gray-100'
                                                }`}>
                                                <Key className={`w-5 h-5 ${keyItem.isActive
                                                    ? health?.rateLimited
                                                        ? 'text-amber-600'
                                                        : keyItem.isValid === true
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
                                                <span className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 border ${keyItem.provider === 'openai' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    keyItem.provider === 'anthropic' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {keyItem.provider === 'openai' && <Bot className="w-3 h-3" />}
                                                    {keyItem.provider === 'anthropic' && <Brain className="w-3 h-3" />}
                                                    {(!keyItem.provider || keyItem.provider === 'google') && <Sparkles className="w-3 h-3" />}
                                                    {keyItem.provider === 'openai' ? 'OpenAI' : keyItem.provider === 'anthropic' ? 'Anthropic' : 'Gemini'}
                                                </span>
                                                {!keyItem.isActive && (
                                                    <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                                                        Disabled
                                                    </span>
                                                )}
                                                {health?.rateLimited && (
                                                    <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-600 rounded flex items-center gap-1 animate-pulse">
                                                        <AlertCircle className="w-3 h-3" /> Rate Limited
                                                    </span>
                                                )}
                                                {keyItem.isValid === true && !health?.rateLimited && (
                                                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Valid
                                                    </span>
                                                )}
                                                {keyItem.isValid === false && (
                                                    <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" /> Invalid
                                                    </span>
                                                )}
                                                {keyItem.isValid === null && keyItem.isActive && !health?.rateLimited && (
                                                    <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-600 rounded flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> Untested
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <code className="font-mono">
                                                        {showKeyValue[keyItem.id] ? keyItem.key : keyItem.maskedKey}
                                                    </code>
                                                    <button
                                                        onClick={() => toggleShowKey(keyItem.id)}
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        {showKeyValue[keyItem.id] ? (
                                                            <EyeOff className="w-3 h-3" />
                                                        ) : (
                                                            <Eye className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                {health && (
                                                    <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                        Calls: <strong>{health.callCount}</strong>
                                                    </span>
                                                )}
                                            </div>
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
                                );
                            })}
                        </div>
                    )}

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <strong>💡 Tip:</strong> Add multiple API keys for redundancy. The system will automatically
                        rotate to backup keys if the primary key gets rate-limited or encounters errors.
                    </div>
                </div >
            </div >
        </div >
    );
}
