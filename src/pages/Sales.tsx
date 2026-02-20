import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, PlayCircle } from "lucide-react";

const recentSales = [
  { id: "INV-001", date: "2026-02-20", customer: "Walk-in", items: 5, total: 1250, gst: 150, method: "Cash", status: "completed" },
  { id: "INV-002", date: "2026-02-20", customer: "Sharma Traders", items: 12, total: 8500, gst: 1020, method: "UPI", status: "completed" },
  { id: "INV-003", date: "2026-02-19", customer: "Walk-in", items: 2, total: 340, gst: 40.8, method: "Card", status: "completed" },
  { id: "INV-004", date: "2026-02-19", customer: "Patel Enterprises", items: 8, total: 4200, gst: 504, method: "Check", status: "completed" },
  { id: "INV-005", date: "2026-02-18", customer: "Walk-in", items: 3, total: 720, gst: 86.4, method: "Cash", status: "completed" },
];

const suspendedSales = [
  { id: "SS-001", customer: "Mr. Kumar", reference: "Table 3", items: 4, total: 960, notes: "Waiting for more items" },
  { id: "SS-002", customer: "Wholesale Client", reference: "Order #45", items: 15, total: 12500, notes: "Price confirmation pending" },
];

export default function Sales() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sales</h1>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Sales</TabsTrigger>
          <TabsTrigger value="suspended">
            Suspended ({suspendedSales.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.id}</TableCell>
                      <TableCell className="text-muted-foreground">{s.date}</TableCell>
                      <TableCell>{s.customer}</TableCell>
                      <TableCell className="text-right">{s.items}</TableCell>
                      <TableCell className="text-right">₹{s.gst.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">₹{s.total.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspended">
          <div className="grid gap-4">
            {suspendedSales.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.customer} — {s.reference}</p>
                    <p className="text-sm text-muted-foreground">{s.items} items · ₹{s.total.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>
                  </div>
                  <Button size="sm">
                    <PlayCircle className="mr-1 h-4 w-4" /> Resume
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
