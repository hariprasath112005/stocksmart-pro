import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input defaultValue="StockSmart Retail Store" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GSTIN</Label>
              <Input defaultValue="27AABCU9603R1ZM" />
            </div>
            <div className="space-y-2">
              <Label>State Code</Label>
              <Input defaultValue="27 - Maharashtra" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input defaultValue="123, Market Road, Mumbai - 400001" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="billing@stocksmart.in" />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">Default GST slabs: 5%, 12%, 18%, 28%</p>
          <p className="text-muted-foreground">Transaction type: Intra-state (CGST + SGST applied)</p>
          <p className="text-muted-foreground">Inter-state transactions apply IGST instead.</p>
        </CardContent>
      </Card>
    </div>
  );
}
