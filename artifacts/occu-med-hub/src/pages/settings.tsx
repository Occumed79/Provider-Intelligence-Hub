import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Shield, Bell, Database, User, Key, Globe } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight glow-text text-white">System Configuration</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">Manage intelligence pipeline parameters, user access, and system-wide extraction thresholds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-white bg-white/10 hover:bg-white/20 hover:text-white font-medium tracking-wide">
             <SettingsIcon className="h-4 w-4 mr-3 text-primary" /> General
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-white/5 hover:text-white font-medium tracking-wide">
             <Database className="h-4 w-4 mr-3 text-muted-foreground" /> Pipeline
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-white/5 hover:text-white font-medium tracking-wide">
             <Shield className="h-4 w-4 mr-3 text-muted-foreground" /> Security
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-white/5 hover:text-white font-medium tracking-wide">
             <Bell className="h-4 w-4 mr-3 text-muted-foreground" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-white/5 hover:text-white font-medium tracking-wide">
             <User className="h-4 w-4 mr-3 text-muted-foreground" /> Account
          </Button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="glass-panel border-white/[0.05] bg-black/40">
            <CardHeader className="border-b border-white/[0.05] bg-white/[0.01]">
              <CardTitle className="text-lg text-white">Extraction Thresholds</CardTitle>
              <CardDescription>Adjust AI confidence levels required for auto-approval.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white font-semibold tracking-wide">Auto-Approve High Confidence</Label>
                  <p className="text-sm text-muted-foreground">Bypass manual review queue when confidence &gt; 90%</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white font-semibold tracking-wide">Strict Entity Matching</Label>
                  <p className="text-sm text-muted-foreground">Require exact name + address match to link evidence</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/[0.05] bg-black/40">
            <CardHeader className="border-b border-white/[0.05] bg-white/[0.01]">
              <CardTitle className="text-lg text-white">API Integrations</CardTitle>
              <CardDescription>Manage external data enrichment sources.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-white font-semibold tracking-wide flex items-center gap-2"><Globe className="h-4 w-4 text-blue-400" /> Geolocation API Key</Label>
                <div className="flex gap-3">
                  <Input type="password" value="************************" readOnly className="bg-black/60 border-white/10 text-muted-foreground font-mono" />
                  <Button variant="outline" className="border-white/10 hover:bg-white/10 shrink-0">Update</Button>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-white font-semibold tracking-wide flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> OCR Engine Token</Label>
                <div className="flex gap-3">
                  <Input type="password" value="************************" readOnly className="bg-black/60 border-white/10 text-muted-foreground font-mono" />
                  <Button variant="outline" className="border-white/10 hover:bg-white/10 shrink-0">Update</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
             <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">Discard Changes</Button>
             <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">Save Configuration</Button>
          </div>
        </div>
      </div>
    </div>
  );
}