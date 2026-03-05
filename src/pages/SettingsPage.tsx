import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    unit_name: "",
    address: "",
    gstin: "",
    state: "",
    state_code: "",
    phone: "",
    email: "",
    bank_name: "",
    account_no: "",
    ifsc_code: "",
    inventory_password: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        company_name: settings.company_name || "",
        unit_name: settings.unit_name || "",
        address: settings.address || "",
        gstin: settings.gstin || "",
        state: settings.state || "",
        state_code: settings.state_code || "",
        phone: settings.phone || "",
        email: settings.email || "",
        bank_name: settings.bank_name || "",
        account_no: settings.account_no || "",
        ifsc_code: settings.ifsc_code || "",
        inventory_password: settings.inventory_password || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    if (settings) {
      updateSettings.mutate({ ...settings, ...form });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === settings?.inventory_password) {
      setIsAuthenticated(true);
    } else {
      import("sonner").then(({ toast }) => toast.error("Incorrect password"));
    }
  };

  if (isLoading) return <div className="p-6">Loading settings...</div>;

  if (settings?.inventory_password && !isAuthenticated) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Card className="w-full max-max-w-sm">
          <CardHeader>
            <CardTitle>Settings Access</CardTitle>
            <p className="text-sm text-muted-foreground">Please enter the password to modify settings.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter Password</Label>
                <Input 
                  type="password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">Unlock Settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GSTIN</Label>
                <Input value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State Name</Label>
                <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State Code</Label>
                <Input value={form.state_code} onChange={e => setForm({ ...form, state_code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input value={form.account_no} onChange={e => setForm({ ...form, account_no: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input value={form.ifsc_code} onChange={e => setForm({ ...form, ifsc_code: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Inventory Access Password</Label>
              <Input 
                type="password" 
                value={form.inventory_password} 
                onChange={e => setForm({ ...form, inventory_password: e.target.value })} 
                placeholder="Leave blank to disable"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">Default GST slabs: 5%, 12%, 18%, 28%</p>
          <p className="text-muted-foreground">Transaction type: Intra-state (CGST + SGST applied) when Seller and Buyer state codes match.</p>
          <p className="text-muted-foreground">Inter-state transactions apply IGST instead.</p>
        </CardContent>
      </Card>
    </div>
  );
}
