"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

interface SkillsChartProps {
  sections: Record<string, { score: number; feedback: string }>;
}

export default function SkillsChart({ sections }: SkillsChartProps) {
  if (!sections || Object.keys(sections).length === 0) {
    return null;
  }

  const radarData = Object.entries(sections).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: (Number(value?.score) || 5) * 10,
  }));

  const barData = Object.entries(sections).map(([key, value]) => {
    const score = Number(value?.score) || 5;
    return {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      score,
      fill: score >= 7 ? "#16a34a" : score >= 5 ? "#d97706" : "#dc2626",
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Radar */}
      <div className="border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Overall Radar</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar */}
      <div className="border border-gray-100 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Section Scores</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
              {barData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
