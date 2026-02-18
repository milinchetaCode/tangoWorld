"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, use, useCallback } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Users, CreditCard, PlusCircle, Trash2, XCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import DashboardSkeleton from '@/components/DashboardSkeleton';

interface EventCost {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
}

interface BusinessDashboardData {
    costs: EventCost[];
    costsByCategory: Record<string, number>;
    totalCosts: number;
    confirmedRevenue: number;
    theoreticalRevenue: number;
    pendingRevenue: number;
    netProfitConfirmed: number;
    netProfitTheoretical: number;
    paymentCompletionRate: number;
    totalAcceptedApplications: number;
    paidApplications: number;
}

const COST_CATEGORIES = [
    { value: 'rent', label: 'Venue Rent' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'food', label: 'Food & Catering' },
    { value: 'other', label: 'Other' },
];

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function BusinessDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<BusinessDashboardData | null>(null);
    const [eventTitle, setEventTitle] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddCostForm, setShowAddCostForm] = useState(false);
    const [newCost, setNewCost] = useState({
        category: 'rent',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
    });

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        try {
            // Fetch event details
            const eventRes = await fetch(getApiUrl(`/events/${id}`));
            if (!eventRes.ok) {
                throw new Error('Failed to fetch event');
            }
            const eventData = await eventRes.json();
            setEventTitle(eventData.title);

            // Fetch business dashboard data
            const dashboardRes = await fetch(getApiUrl(`/events/${id}/business-dashboard`), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!dashboardRes.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            const data = await dashboardRes.json();
            setDashboardData(data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load business dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddCost = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(getApiUrl(`/events/${id}/costs`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category: newCost.category,
                    description: newCost.description,
                    amount: parseFloat(newCost.amount),
                    date: newCost.date,
                }),
            });

            if (res.ok) {
                setNewCost({
                    category: 'rent',
                    description: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                });
                setShowAddCostForm(false);
                toast.success('Cost added successfully');
                await fetchData();
            } else {
                toast.error('Failed to add cost. Please try again.');
            }
        } catch (err) {
            console.error('Error adding cost:', err);
            toast.error('Failed to add cost. Please try again.');
        }
    };

    const handleDeleteCost = async (costId: string) => {
        if (!confirm('Are you sure you want to delete this cost?')) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(getApiUrl(`/events/${id}/costs/${costId}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                toast.success('Cost deleted successfully');
                await fetchData();
            } else {
                toast.error('Failed to delete cost. Please try again.');
            }
        } catch (err) {
            console.error('Error deleting cost:', err);
            toast.error('Failed to delete cost. Please try again.');
        }
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error || !dashboardData) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 min-h-screen">
                <div className="text-center py-12 bg-white rounded-2xl ring-1 ring-slate-200">
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">Error Loading Dashboard</h3>
                    <p className="mt-2 text-sm text-slate-500">{error || 'Dashboard data not found'}</p>
                    <div className="mt-6 flex gap-4 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-300 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => fetchData()}
                            className="inline-flex items-center rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const costChartData = Object.entries(dashboardData.costsByCategory).map(([category, amount]) => ({
        name: COST_CATEGORIES.find(c => c.value === category)?.label || category,
        value: amount,
    }));

    const revenueChartData = [
        { name: 'Confirmed Revenue', value: dashboardData.confirmedRevenue, fill: '#10b981' },
        { name: 'Pending Revenue', value: dashboardData.pendingRevenue, fill: '#f59e0b' },
    ];

    const profitChartData = [
        { name: 'Costs', value: dashboardData.totalCosts, fill: '#ef4444' },
        { name: 'Confirmed Revenue', value: dashboardData.confirmedRevenue, fill: '#10b981' },
        { name: 'Theoretical Revenue', value: dashboardData.theoreticalRevenue, fill: '#3b82f6' },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <button onClick={() => router.back()} className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Manage Event
                </button>
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Business Dashboard: {eventTitle}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Financial overview and cost management
                        </p>
                    </div>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <DollarSign className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-slate-600 truncate">Total Costs</dt>
                                <dd className="text-lg font-semibold text-slate-900">${dashboardData.totalCosts.toFixed(2)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-slate-600 truncate">Confirmed Revenue</dt>
                                <dd className="text-lg font-semibold text-slate-900">${dashboardData.confirmedRevenue.toFixed(2)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-slate-600 truncate">Theoretical Revenue</dt>
                                <dd className="text-lg font-semibold text-slate-900">${dashboardData.theoreticalRevenue.toFixed(2)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {dashboardData.netProfitConfirmed >= 0 ? (
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            ) : (
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            )}
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-slate-600 truncate">Net Profit (Confirmed)</dt>
                                <dd className={`text-lg font-semibold ${dashboardData.netProfitConfirmed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${dashboardData.netProfitConfirmed.toFixed(2)}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Users className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-slate-600 truncate">Payment Completion</dt>
                                <dd className="text-lg font-semibold text-slate-900">
                                    {dashboardData.paymentCompletionRate.toFixed(1)}%
                                </dd>
                                <dd className="text-xs text-slate-500">
                                    {dashboardData.paidApplications} / {dashboardData.totalAcceptedApplications} paid
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CreditCard className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-slate-600 truncate">Pending Revenue</dt>
                                <dd className="text-lg font-semibold text-slate-900">${dashboardData.pendingRevenue.toFixed(2)}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {dashboardData.netProfitTheoretical >= 0 ? (
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            ) : (
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            )}
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-slate-600 truncate">Net Profit (Theoretical)</dt>
                                <dd className={`text-lg font-semibold ${dashboardData.netProfitTheoretical >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    ${dashboardData.netProfitTheoretical.toFixed(2)}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
                {/* Revenue Breakdown */}
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <h3 className="text-base font-semibold leading-7 text-slate-900 mb-4">Revenue Breakdown</h3>
                    {dashboardData.theoreticalRevenue > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={revenueChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {revenueChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | undefined) => `$${(value ?? 0).toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-500">
                            No revenue data yet
                        </div>
                    )}
                </div>

                {/* Costs by Category */}
                <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                    <h3 className="text-base font-semibold leading-7 text-slate-900 mb-4">Costs by Category</h3>
                    {costChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={costChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {costChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number | undefined) => `$${(value ?? 0).toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-slate-500">
                            No costs logged yet
                        </div>
                    )}
                </div>
            </div>

            {/* Profit Comparison Chart */}
            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6 mb-8">
                <h3 className="text-base font-semibold leading-7 text-slate-900 mb-4">Financial Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={profitChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number | undefined) => `$${(value ?? 0).toFixed(2)}`} />
                        <Bar dataKey="value" fill="#8884d8">
                            {profitChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Cost Management Section */}
            <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold leading-7 text-slate-900">Event Costs</h3>
                    <button
                        onClick={() => setShowAddCostForm(!showAddCostForm)}
                        className="inline-flex items-center rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
                    >
                        <PlusCircle className="mr-1.5 h-4 w-4" />
                        Add Cost
                    </button>
                </div>

                {/* Add Cost Form */}
                {showAddCostForm && (
                    <form onSubmit={handleAddCost} className="mb-6 p-4 bg-slate-50 rounded-xl">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={newCost.category}
                                    onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
                                    required
                                >
                                    {COST_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
                                    Amount ($)
                                </label>
                                <input
                                    type="number"
                                    id="amount"
                                    step="0.01"
                                    min="0"
                                    value={newCost.amount}
                                    onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={newCost.description}
                                    onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={newCost.date}
                                    onChange={(e) => setNewCost({ ...newCost, date: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
                            >
                                Save Cost
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddCostForm(false)}
                                className="inline-flex justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Costs List */}
                <div className="mt-4">
                    {dashboardData.costs.length === 0 ? (
                        <p className="text-center py-8 text-slate-500">No costs recorded yet</p>
                    ) : (
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Amount</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {dashboardData.costs.map((cost) => (
                                        <tr key={cost.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                                                {new Date(cost.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                                                {COST_CATEGORIES.find(c => c.value === cost.category)?.label || cost.category}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-900">{cost.description}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 text-right">
                                                ${Number(cost.amount).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                                <button
                                                    onClick={() => handleDeleteCost(cost.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete cost"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
