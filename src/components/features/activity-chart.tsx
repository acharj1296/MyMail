"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { day: "Mon", received: 14, sent: 7 }, { day: "Tue", received: 22, sent: 11 }, { day: "Wed", received: 17, sent: 9 },
  { day: "Thu", received: 28, sent: 15 }, { day: "Fri", received: 23, sent: 12 }, { day: "Sat", received: 13, sent: 6 }, { day: "Sun", received: 19, sent: 10 },
];

export function ActivityChart() {
  return (
    <Card className="h-full min-w-0">
      <CardHeader className="flex-row items-start justify-between pb-1">
        <div><CardTitle>Email activity</CardTitle><p className="mt-1 text-xs text-muted-foreground">Illustrative activity for the last 7 days</p></div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-primary" />Received</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-sky-400" />Sent demo</span></div>
      </CardHeader>
      <CardContent className="h-[250px] pt-4">
        <div className="h-full w-full" role="img" aria-label="Area chart showing demo email activity for each day of the week">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
              <defs><linearGradient id="receivedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7165df" stopOpacity={0.22} /><stop offset="95%" stopColor="#7165df" stopOpacity={0.01} /></linearGradient><linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.15} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0.01} /></linearGradient></defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 5" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} dy={8} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,.08)" }} />
              <Area type="monotone" dataKey="received" name="Received (demo)" stroke="#7165df" strokeWidth={2} fill="url(#receivedFill)" activeDot={{ r: 4 }} />
              <Area type="monotone" dataKey="sent" name="Sent (demo)" stroke="#38bdf8" strokeWidth={2} fill="url(#sentFill)" activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
