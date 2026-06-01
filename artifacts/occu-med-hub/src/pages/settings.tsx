import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Shield, Bell, Database, User, Key, Globe, AlertCircle, Save } from "lucide-react";

type SettingRow = { key: string; value: string | null; valueType: string; isSecret: boolean; updatedAt?: string };
function boolValue(value: unknown, fallback = false) { const text = String(value ?? "").toLowerCase(); if (text === "true") return true; if (text === "false") return false; return fallback; }
function findSetting(rows: SettingRow[] | undefined, key: string) { return Array.isArray(rows) ? rows.find((row) => row.key === key) : undefined; }

export default function Settings() {
  const queryClient = useQueryClient();
  const [autoApprove, setAutoApprove] = React.useState(true);
  const [strictMatch, setStrictMatch] = React.useState(true);
  const [geoKey, setGeoKey] = React.useState("");
  const [ocrToken, setOcrToken] = React.useState("");
  const [notice, setNotice] = React.useState<string | null>(null);
  const { data: settings, isLoading } = useQuery<SettingRow[]>({ queryKey: ["/api/settings"], queryFn: () => customFetch("/api/settings") });
  const saveMutation = useMutation({ mutationFn: (settings: any[]) => customFetch("/api/settings", { method: "PATCH", body: JSON.stringify({ settings }) }), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/settings"] }); setNotice("Settings saved to the backend database."); }, onError: (err: any) => setNotice(err?.message || "Failed to save settings.") });

  React.useEffect(() => {
    if (!settings) return;
    setAutoApprove(boolValue(findSetting(settings, "autoApproveHighConfidence")?.value, true));
    setStrictMatch(boolValue(findSetting(settings, "strictEntityMatching")?.value, true));
    setGeoKey(findSetting(settings, "geolocationApiKey")?.value === "********" ? "" : String(findSetting(settings, "geolocationApiKey")?.value || ""));
    setOcrToken(findSetting(settings, "ocrEngineToken")?.value === "********" ? "" : String(findSetting(settings, "ocrEngineToken")?.value || ""));
  }, [settings]);

  const saveSettings = () => saveMutation.mutate([
    { key: "autoApproveHighConfidence", value: String(autoApprove), valueType: "boolean", isSecret: false },
    { key: "strictEntityMatching", value: String(strictMatch), valueType: "boolean", isSecret: false },
    ...(geoKey.trim() ? [{ key: "geolocationApiKey", value: geoKey.trim(), valueType: "secret", isSecret: true }] : []),
    ...(ocrToken.trim() ? [{ key: "ocrEngineToken", value: ocrToken.trim(), valueType: "secret", isSecret: true }] : []),
  ]);
  const resetLocal = () => { setAutoApprove(true); setStrictMatch(true); setGeoKey(""); setOcrToken(""); setNotice("Local form reset. Click Save Configuration to persist changes."); };

  return <div className="space-y-8 max-w-5xl mx-auto pb-12"><div><h1 className="text-3xl font-bold tracking-tight text-white">System Configuration</h1><p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">Review pipeline, integration, and account settings backed by the settings API.</p></div>{notice && <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary flex gap-2"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{notice}</div>}{isLoading && <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground">Loading saved settings...</div>}<div className="grid grid-cols-1 md:grid-cols-4 gap-8"><div className="md:col-span-1 space-y-1"><NavButton active icon={<SettingsIcon className="h-4 w-4 mr-3 text-primary" />} label="General" /><NavButton icon={<Database className="h-4 w-4 mr-3 text-muted-foreground" />} label="Pipeline" /><NavButton icon={<Shield className="h-4 w-4 mr-3 text-muted-foreground" />} label="Security" /><NavButton icon={<Bell className="h-4 w-4 mr-3 text-muted-foreground" />} label="Notifications" /><NavButton icon={<User className="h-4 w-4 mr-3 text-muted-foreground" />} label="Account" /></div><div className="md:col-span-3 space-y-6"><Card className="glass-panel border-white/[0.05] bg-black/40"><CardHeader className="border-b border-white/[0.05] bg-white/[0.01]"><CardTitle className="text-lg text-white">Extraction Thresholds</CardTitle><CardDescription>Saved controls for confidence and matching behavior.</CardDescription></CardHeader><CardContent className="p-6 space-y-6"><SettingSwitch title="Auto-Approve High Confidence" description="Bypass manual review when confidence is greater than 90%." checked={autoApprove} onCheckedChange={setAutoApprove} /><SettingSwitch title="Strict Entity Matching" description="Require exact name and address matching before linking evidence." checked={strictMatch} onCheckedChange={setStrictMatch} /></CardContent></Card><Card className="glass-panel border-white/[0.05] bg-black/40"><CardHeader className="border-b border-white/[0.05] bg-white/[0.01]"><CardTitle className="text-lg text-white">API Integrations</CardTitle><CardDescription>Secret values are masked after save. Leave blank to keep the saved secret unchanged.</CardDescription></CardHeader><CardContent className="p-6 space-y-6"><SecretField icon={<Globe className="h-4 w-4 text-primary" />} label="Geolocation API Key" value={geoKey} onChange={setGeoKey} placeholder={findSetting(settings, "geolocationApiKey")?.value === "********" ? "Saved secret exists" : "Paste key"} /><SecretField icon={<Key className="h-4 w-4 text-primary" />} label="OCR Engine Token" value={ocrToken} onChange={setOcrToken} placeholder={findSetting(settings, "ocrEngineToken")?.value === "********" ? "Saved secret exists" : "Paste token"} /></CardContent></Card><div className="flex justify-end gap-4"><Button variant="outline" onClick={resetLocal} className="border-white/10 bg-white/5 hover:bg-white/10">Reset Form</Button><Button onClick={saveSettings} disabled={saveMutation.isPending} className="bg-primary hover:bg-primary/90 text-white"><Save className="h-4 w-4 mr-2" />{saveMutation.isPending ? "Saving..." : "Save Configuration"}</Button></div></div></div></div>;
}
function NavButton({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) { return <Button variant="ghost" className={`w-full justify-start font-medium tracking-wide ${active ? "text-white bg-white/10 hover:bg-white/20" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}>{icon}{label}</Button>; }
function SettingSwitch({ title, description, checked, onCheckedChange }: { title: string; description: string; checked: boolean; onCheckedChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-6"><div className="space-y-0.5"><Label className="text-base text-white font-semibold tracking-wide">{title}</Label><p className="text-sm text-muted-foreground">{description}</p></div><Switch checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-primary" /></div>; }
function SecretField({ icon, label, value, onChange, placeholder }: { icon: React.ReactNode; label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <div className="space-y-3"><Label className="text-white font-semibold tracking-wide flex items-center gap-2">{icon}{label}</Label><Input type="password" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-black/60 border-white/10 text-white font-mono placeholder:text-muted-foreground" /></div>; }
