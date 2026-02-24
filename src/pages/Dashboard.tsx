import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  TrendingUp,
  Package,
  Wallet,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useDashboard } from "@/hooks/useSales";
import { Skeleton } from "@/components/ui/skeleton";

const PIE_COLORS = [
  "hsl(220, 70%, 50%)",
  "hsl(150, 60%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 72%, 51%)",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  const { stats, dailySales, topSelling, stockPie } = data || { stats: {}, dailySales: [], topSelling: [], stockPie: [] };

  const statCards = [
    { label: "Today's Sales", value: `₹${(stats.today || 0).toLocaleString("en-IN")}`, icon: IndianRupee },
    { label: "Monthly Sales", value: `₹${(stats.month || 0).toLocaleString("en-IN")}`, icon: TrendingUp },
    { label: "Total Stock Units", value: (stats.totalStock || 0).toLocaleString("en-IN"), icon: Package },
    { label: "Total Sale Orders", value: (stats.totalSalesCount || 0).toLocaleString("en-IN"), icon: Wallet },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/pos")}>
            <ShoppingCart className="mr-2 h-4 w-4" /> New Sale
          </Button>
          <Button variant="outline" onClick={() => navigate("/reports")}>
            <BarChart3 className="mr-2 h-4 w-4" /> Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Sales (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Sales"]} />
                  <Bar dataKey="amount" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topSelling.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="text-muted-foreground">{item.qty} sold</span>
                  <span className="font-semibold w-20 text-right">₹{Number(item.revenue).toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
