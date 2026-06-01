import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Plus, Trash2 } from "lucide-react";

type Row = { id: string; category: string; service: string; localFee: string; notes: string };
const COMMON_CURRENCIES = ["EUR", "GBP", "CAD", "AUD", "JPY", "MXN", "COP", "INR", "PHP", "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "CHF", "SEK", "NOK", "DKK", "NZD", "SGD", "HKD", "ZAR", "BRL", "TRY", "ILS", "KRW", "THB", "VND", "IDR", "MYR", "PLN", "CZK", "HUF", "RON"];
const DEFAULT_ROWS: Row[] = [
  { id: "1", category: "Medical Testing", service: "Physical Examination", localFee: "", notes: "" },
  { id: "2", category: "Laboratory Testing", service: "CBC", localFee: "", notes: "" },
  { id: "3", category: "Laboratory Testing", service: "Chemistry Panel", localFee: "", notes: "" },
  { id: "4", category: "Imaging", service: "Chest X-Ray", localFee: "", notes: "" },
  { id: "5", category: "Vaccinations", service: "Vaccination Administration", localFee: "", notes: "" },
  { id: "6", category: "Administrative / Forms", service: "Form Completion", localFee: "", notes: "" },
];
function normalizeCurrency(value: string) { return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3); }
function money(value: number) { return Number.isFinite(value) ? value.toFixed(2) : ""; }
function csvEscape(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
export default function CurrencyFeeSchedule() {
  const [currency, setCurrency] = React.useState("EUR");
  const [rate, setRate] = React.useState<number>(1);
  const [manualRate, setManualRate] = React.useState("");
  const [lastUpdated, setLastUpdated] = React.useState<string>("");
  const [status, setStatus] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Row[]>(DEFAULT_ROWS);
  const activeRate = manualRate.trim() ? Number(manualRate) : rate;
  const refreshRate = React.useCallback(async () => {
    const code = normalizeCurrency(currency);
    if (code.length !== 3) { setStatus("Enter a valid 3-letter currency code, such as EUR, GBP, JPY, or MXN."); return; }
    setStatus("Loading live exchange rate...");
    try {
      const response = await fetch(`https://api.frankfurter.app/latest?from=${code}&to=USD`);
      if (!response.ok) throw new Error("Rate API failed");
      const data = await response.json();
      const nextRate = Number(data?.rates?.USD);
      if (!Number.isFinite(nextRate)) throw new Error("USD rate missing");
      setRate(nextRate);
      setCurrency(code);
      setLastUpdated(new Date().toLocaleString());
      setStatus(`Live rate loaded: 1 ${code} = ${nextRate.toFixed(6)} USD`);
    } catch {
      setStatus(`${code} is not available from the free live rate feed. Enter a manual USD rate override below.`);
    }
  }, [currency]);
  React.useEffect(() => { refreshRate(); }, []);
  const updateRow = (id: string, patch: Partial<Row>) => setRows((prev) => prev.map((row) => row.id === id ? { ...row, ...patch } : row));
  const addRow = () => setRows((prev) => [...prev, { id: String(Date.now()), category: "Other", service: "", localFee: "", notes: "" }]);
  const deleteRow = (id: string) => setRows((prev) => prev.filter((row) => row.id !== id));
  const exportCsv = () => {
    const code = normalizeCurrency(currency);
    const header = ["Category", "Service / Item", "Local Currency", "Local Fee", "USD Exchange Rate", "USD Fee", "Notes"];
    const body = rows.map((row) => { const local = Number(row.localFee); const usd = Number.isFinite(local) ? local * activeRate : 0; return [row.category, row.service, code, row.localFee, activeRate, money(usd), row.notes]; });
    const csv = [header, ...body].map((line) => line.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `currency-fee-schedule-${code || "custom"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return <div className="space-y-6 pb-12"><div><h1 className="text-3xl font-bold tracking-tight text-white">Currency Fee Schedule</h1><p className="text-muted-foreground mt-1">Enter any 3-letter currency code, pull a live USD conversion when available, manually override the rate when needed, and export the completed schedule.</p></div>{status && <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">{status}</div>}<Card className="glass-panel border-white/[0.06] bg-black/40"><CardHeader><CardTitle className="text-white">Exchange Rate</CardTitle><CardDescription>Uses the free Frankfurter API for supported currencies. Any unsupported currency can still be used with a manual USD rate override.</CardDescription></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3"><div className="space-y-2"><Input value={currency} onChange={(e) => setCurrency(normalizeCurrency(e.target.value))} placeholder="Any code, e.g. EUR" className="bg-black/40 border-white/10 text-white uppercase" /><select value={COMMON_CURRENCIES.includes(currency) ? currency : ""} onChange={(e) => e.target.value && setCurrency(e.target.value)} className="w-full bg-black text-white border border-white/10 rounded p-2"><option value="">Common currencies</option>{COMMON_CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}</select></div><Input value={activeRate || ""} readOnly className="bg-black/40 border-white/10 text-white" /><Input value={manualRate} onChange={(e) => setManualRate(e.target.value)} placeholder="Manual USD rate override" className="bg-black/40 border-white/10 text-white" /><Button onClick={refreshRate} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Refresh Rate</Button><Badge variant="outline" className="justify-center border-white/10 text-muted-foreground">{lastUpdated ? `Updated ${lastUpdated}` : "Not updated"}</Badge></CardContent></Card><Card className="glass-panel border-white/[0.06] bg-black/40"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="text-white">Fee Schedule Rows</CardTitle><CardDescription>Manual local fees automatically calculate the USD equivalent.</CardDescription></div><div className="flex gap-2"><Button onClick={addRow} variant="outline"><Plus className="h-4 w-4 mr-2" />Add Row</Button><Button onClick={exportCsv} className="bg-primary hover:bg-primary/90"><Download className="h-4 w-4 mr-2" />Export CSV</Button></div></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-[1.2fr_1.6fr_1fr_1fr_1fr_1.4fr_auto] gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground"><div>Category</div><div>Service / Item</div><div>Currency</div><div>Local Fee</div><div>USD Fee</div><div>Notes</div><div /></div>{rows.map((row) => { const local = Number(row.localFee); const usd = Number.isFinite(local) ? local * activeRate : 0; return <div key={row.id} className="grid grid-cols-[1.2fr_1.6fr_1fr_1fr_1fr_1.4fr_auto] gap-2"><Input value={row.category} onChange={(e) => updateRow(row.id, { category: e.target.value })} className="bg-black/40 border-white/10 text-white" /><Input value={row.service} onChange={(e) => updateRow(row.id, { service: e.target.value })} className="bg-black/40 border-white/10 text-white" /><Input value={normalizeCurrency(currency)} readOnly className="bg-black/40 border-white/10 text-muted-foreground" /><Input value={row.localFee} onChange={(e) => updateRow(row.id, { localFee: e.target.value })} className="bg-black/40 border-white/10 text-white" /><Input value={money(usd)} readOnly className="bg-black/40 border-white/10 text-primary font-semibold" /><Input value={row.notes} onChange={(e) => updateRow(row.id, { notes: e.target.value })} className="bg-black/40 border-white/10 text-white" /><Button size="icon" variant="ghost" onClick={() => deleteRow(row.id)}><Trash2 className="h-4 w-4" /></Button></div>; })}</CardContent></Card></div>;
}
