import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Package, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { Skeleton } from "@/components/ui/skeleton";

const LOW_STOCK_THRESHOLD = 15;

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading, error } = useProducts();

  const filtered = Array.isArray(products) ? products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const lowStockCount = filtered.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm">Manage your products and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <AddProductDialog />
          <Button variant="outline">
            <ArrowRightLeft className="mr-2 h-4 w-4" /> Stock Transfer
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-semibold">Backend Connection Issue</p>
              <p>{(error as Error).message}</p>
            </div>
            <Button size="sm" variant="outline" className="ml-auto border-destructive/50 hover:bg-destructive/20" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-xl font-bold">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-xl font-bold">{lowStockCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Product Catalog</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {error ? "No products found due to connection error." : "No products found. Add your first product to get started!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Default GST</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Warehouse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{p.gst_rate}%</TableCell>
                    <TableCell className="text-right">
                      <span className={p.stock <= LOW_STOCK_THRESHOLD ? "text-destructive font-semibold" : ""}>
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.warehouse}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

