import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, PlayCircle } from "lucide-react";
import { useSalesQuery } from "@/hooks/useSales";
import { Skeleton } from "@/components/ui/skeleton";

// Mock suspended sales for now as the backend API for them is not yet implemented
const suspendedSales = [
  { id: "SS-001", customer: "Mr. Kumar", reference: "Table 3", items: 4, total: 960, notes: "Waiting for more items" },
  { id: "SS-002", customer: "Wholesale Client", reference: "Order #45", items: 15, total: 12500, notes: "Price confirmation pending" },
];

export default function Sales() {
  const { data: sales = [], isLoading } = useSalesQuery();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Sales</h1>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : sales.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No sales found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.invoice_number}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString("en-IN")}</TableCell>
                        <TableCell>{s.customer_name}</TableCell>
                        <TableCell className="text-right font-semibold">₹{Number(s.grand_total).toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{s.payment_method}</Badge>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
