import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const monthlySales = [
  { month: "Sep", amount: 320000 },
  { month: "Oct", amount: 410000 },
  { month: "Nov", amount: 385000 },
  { month: "Dec", amount: 520000 },
  { month: "Jan", amount: 445000 },
  { month: "Feb", amount: 485200 },
];

const taxBreakdown = [
  { category: "5% GST Items", taxable: 120000, cgst: 3000, sgst: 3000, igst: 0, total: 6000 },
  { category: "12% GST Items", taxable: 85000, cgst: 5100, sgst: 5100, igst: 0, total: 10200 },
  { category: "18% GST Items", taxable: 210000, cgst: 18900, sgst: 18900, igst: 0, total: 37800 },
  { category: "28% GST Items", taxable: 45000, cgst: 6300, sgst: 6300, igst: 0, total: 12600 },
];

const itemWise = [
  { name: "Tata Salt 1kg", sold: 142, revenue: 2840, profit: 710 },
  { name: "Amul Butter 500g", sold: 98, revenue: 4900, profit: 1176 },
  { name: "Maggi Noodles Pack", sold: 85, revenue: 1020, profit: 340 },
  { name: "Surf Excel 1kg", sold: 72, revenue: 5040, profit: 1440 },
  { name: "Red Label Tea 500g", sold: 65, revenue: 9750, profit: 2600 },
];

export default function Reports() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="tax">Tax (GST)</TabsTrigger>
          <TabsTrigger value="items">Item-wise</TabsTrigger>
          <TabsTrigger value="pnl">P&L</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                    <Bar dataKey="amount" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">GST Tax Report (CGST + SGST)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Taxable Value</TableHead>
                    <TableHead className="text-right">CGST</TableHead>
                    <TableHead className="text-right">SGST</TableHead>
                    <TableHead className="text-right">IGST</TableHead>
                    <TableHead className="text-right">Total Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxBreakdown.map((t) => (
                    <TableRow key={t.category}>
                      <TableCell className="font-medium">{t.category}</TableCell>
                      <TableCell className="text-right">₹{t.taxable.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{t.cgst.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{t.sgst.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{t.igst}</TableCell>
                      <TableCell className="text-right font-semibold">₹{t.total.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemWise.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.sold}</TableCell>
                      <TableCell className="text-right">₹{item.revenue.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right text-success font-semibold">₹{item.profit.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pnl">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span>Total Revenue</span>
                <span className="font-bold">₹4,85,200</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Cost of Goods Sold</span>
                <span className="font-bold">₹3,20,000</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Gross Profit</span>
                <span className="font-bold text-success">₹1,65,200</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Expenses</span>
                <span className="font-bold text-destructive">₹45,000</span>
              </div>
              <div className="flex justify-between py-2 text-lg">
                <span className="font-bold">Net Profit</span>
                <span className="font-bold text-success">₹1,20,200</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
