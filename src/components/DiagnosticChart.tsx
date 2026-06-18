import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { area: "Vendas", atual: 32, potencial: 88 },
  { area: "Operações", atual: 25, potencial: 92 },
  { area: "Marketing", atual: 48, potencial: 85 },
  { area: "Atendimento", atual: 30, potencial: 80 },
  { area: "Dados", atual: 22, potencial: 90 },
  { area: "Gestão", atual: 38, potencial: 82 },
];

export default function DiagnosticChart() {
  return (
    <div className="h-[300px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="65%" margin={{ top: 12, right: 24, bottom: 12, left: 24 }}>
          <PolarGrid stroke="var(--muted-line)" />
          <PolarAngleAxis
            dataKey="area"
            tick={{ fill: "var(--ink)", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Maturidade atual"
            dataKey="atual"
            stroke="var(--muted-foreground)"
            fill="var(--muted-foreground)"
            fillOpacity={0.15}
            strokeWidth={1.5}
          />
          <Radar
            name="Potencial com IA"
            dataKey="potencial"
            stroke="var(--bronze)"
            fill="var(--bronze)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
