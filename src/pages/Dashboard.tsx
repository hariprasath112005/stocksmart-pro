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

const stats = [
  { label: "Today's Sales", value: "₹24,580", icon: IndianRupee, change: "+12%" },
  { label: "Monthly Sales", value: "₹4,85,200", icon: TrendingUp, change: "+8%" },
  { label: "Inventory Value", value: "₹12,45,000", icon: Package, change: "" },
  { label: "Cash Drawer", value: "₹15,200", icon: Wallet, change: "" },
];

const dailySales = [
  { day: "Mon", amount: 18200 },
  { day: "Tue", amount: 22500 },
  { day: "Wed", amount: 19800 },
  { day: "Thu", amount: 28400 },
  { day: "Fri", amount: 32100 },
  { day: "Sat", amount: 38500 },
  { day: "Sun", amount: 24580 },
];

const stockPie = [
  { name: "Electronics", value: 450000 },
  { name: "Groceries", value: 320000 },
  { name: "Clothing", value: 280000 },
  { name: "Stationery", value: 95000 },
  { name: "Others", value: 100000 },
];

const PIE_COLORS = [
  "hsl(220, 70%, 50%)",
  "hsl(150, 60%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 72%, 51%)",
];

const topSelling = [
  { name: "Tata Salt 1kg", qty: 142, revenue: "₹2,840" },
  { name: "Amul Butter 500g", qty: 98, revenue: "₹4,900" },
  { name: "Maggi Noodles Pack", qty: 85, revenue: "₹1,020" },
  { name: "Surf Excel 1kg", qty: 72, revenue: "₹5,040" },
  { name: "Red Label Tea 500g", qty: 65, revenue: "₹9,750" },
];

export default function Dashboard() {
  const navigate = useNavigate();

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
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  {s.change && (
                    <span className="text-xs text-success font-medium">{s.change} vs yesterday</span>
                  )}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Sales (This Week)</CardTitle>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Stock Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stockPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Legend />
                </PieChart>
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
            {topSelling.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="text-muted-foreground">{item.qty} sold</span>
                  <span className="font-semibold w-20 text-right">{item.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
