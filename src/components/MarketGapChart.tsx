import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const GAP = [
  { l: "Gestão", poderia: 86, usa: 20 },
  { l: "Negócios e finanças", poderia: 88, usa: 45 },
  { l: "Computação", poderia: 94, usa: 33 },
  { l: "Arq. e engenharia", poderia: 78, usa: 15 },
  { l: "Ciências", poderia: 72, usa: 8 },
  { l: "Serviço social", poderia: 55, usa: 6 },
  { l: "Jurídico", poderia: 93, usa: 12 },
  { l: "Educação", poderia: 72, usa: 10 },
  { l: "Artes e mídia", poderia: 85, usa: 18 },
  { l: "Saúde", poderia: 55, usa: 5 },
  { l: "Apoio em saúde", poderia: 40, usa: 5 },
  { l: "Segurança", poderia: 45, usa: 5 },
  { l: "Alimentação", poderia: 30, usa: 3 },
  { l: "Limpeza", poderia: 12, usa: 2 },
  { l: "Cuidados pessoais", poderia: 18, usa: 3 },
  { l: "Vendas", poderia: 62, usa: 20 },
  { l: "Escritório", poderia: 90, usa: 35 },
  { l: "Agropecuária", poderia: 10, usa: 3 },
  { l: "Construção", poderia: 12, usa: 3 },
  { l: "Instalação", poderia: 20, usa: 5 },
  { l: "Produção", poderia: 25, usa: 8 },
  { l: "Transporte", poderia: 20, usa: 5 },
];

export default function MarketGapChart() {
  return (
    <div className="h-[380px] w-full sm:h-[460px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={GAP} outerRadius="72%" margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
          <PolarGrid stroke="var(--muted-line)" />
          <PolarAngleAxis
            dataKey="l"
            tick={{ fill: "var(--ink)", fontSize: 9, fontFamily: "var(--font-mono)" }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Poderia fazer"
            dataKey="poderia"
            stroke="#4F86C6"
            fill="#4F86C6"
            fillOpacity={0.22}
            strokeWidth={2}
          />
          <Radar
            name="Já se usa"
            dataKey="usa"
            stroke="#D14B3D"
            fill="#D14B3D"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
