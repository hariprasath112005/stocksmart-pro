import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useReports } from "@/hooks/useSales";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const { data, isLoading } = useReports();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  const { monthlySales, taxBreakdown, itemWise } = data || { monthlySales: [], taxBreakdown: [], itemWise: [] };

  const totalRevenue = itemWise.reduce((sum: number, item: any) => sum + Number(item.revenue), 0);
  const totalQtySold = itemWise.reduce((sum: number, item: any) => sum + Number(item.sold), 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="tax">Tax (GST)</TabsTrigger>
          <TabsTrigger value="items">Item-wise Sales</TabsTrigger>
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
                    <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `₹${Number(v).toLocaleString("en-IN")}`} />
                    <Bar dataKey="amount" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between">
                 <span className="text-sm text-muted-foreground">Total Revenue (Period)</span>
                 <span className="text-lg font-bold">₹{totalRevenue.toLocaleString("en-IN")}</span>
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
              {taxBreakdown.length === 0 ? (
                 <div className="p-8 text-center text-muted-foreground">No tax data available.</div>
              ) : (
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
                    {taxBreakdown.map((t: any) => (
                      <TableRow key={t.category}>
                        <TableCell className="font-medium">{t.category}</TableCell>
                        <TableCell className="text-right">₹{Number(t.taxable).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">₹{Number(t.cgst).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">₹{Number(t.sgst).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">₹{Number(t.igst).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-semibold">₹{Number(t.total).toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardContent className="p-0">
              {itemWise.length === 0 ? (
                 <div className="p-8 text-center text-muted-foreground">No sales data available.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemWise.map((item: any) => (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.sold}</TableCell>
                        <TableCell className="text-right font-semibold">₹{Number(item.revenue).toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                       <TableCell>Total</TableCell>
                       <TableCell className="text-right">{totalQtySold}</TableCell>
                       <TableCell className="text-right">₹{totalRevenue.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
