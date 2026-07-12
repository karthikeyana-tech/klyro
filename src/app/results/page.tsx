"use client";

import { useAppStore } from "@/lib/store";
import SkillsChart from "@/components/SkillsChart";
import Link from "next/link";

export default function ResultsPage() {
  const { currentAnalysis } = useAppStore();

  if (!currentAnalysis) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400">No results to show</p>
        <Link href="/" className="text-sm text-primary-600 hover:underline">
          ← Go back and upload a resume
        </Link>
      </div>
    );
  }

  // Safe extraction with defaults
  const atsScore = Number(currentAnalysis.atsScore) || 0;
  const skills = currentAnalysis.skills || { found: [], missing: [], matchPercentage: 0 };
  const skillsFound: string[] = Array.isArray(skills.found) ? skills.found : [];
  const skillsMissing: string[] = Array.isArray(skills.missing) ? skills.missing : [];
  const skillsMatch = Number(skills.matchPercentage) || 0;

  const sections = currentAnalysis.sections || {};
  const keywords = currentAnalysis.keywords || { matched: [], missing: [], density: 0 };
  const keywordsDensity = Number(keywords.density) || 0;

  const suggestions: Array<{ category: string; priority: string; suggestion: string; example: string }> =
    Array.isArray(currentAnalysis.suggestions) ? currentAnalysis.suggestions : [];
  const strengths: string[] = Array.isArray(currentAnalysis.strengths) ? currentAnalysis.strengths : [];
  const weaknesses: string[] = Array.isArray(currentAnalysis.weaknesses) ? currentAnalysis.weaknesses : [];

  // Language issues
  const languageIssues = currentAnalysis.languageIssues || { jargon: [], weakVerbs: [], missingMetrics: [], grammar: [] };
  const jargon: Array<{ word: string; context: string; fix: string }> = Array.isArray(languageIssues.jargon) ? languageIssues.jargon : [];
  const weakVerbs: Array<{ word: string; context: string; fix: string }> = Array.isArray(languageIssues.weakVerbs) ? languageIssues.weakVerbs : [];
  const missingMetrics: Array<{ sentence: string; fix: string }> = Array.isArray(languageIssues.missingMetrics) ? languageIssues.missingMetrics : [];
  const grammar: Array<{ issue: string; context: string; fix: string }> = Array.isArray(languageIssues.grammar) ? languageIssues.grammar : [];

  const totalIssues = jargon.length + weakVerbs.length + missingMetrics.length + grammar.length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentAnalysis.fileName || "Resume"} • {currentAnalysis.jobTitle || "General"}
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← New analysis
        </Link>
      </div>

      {/* Scores Row */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreCard label="ATS Score" value={atsScore} />
        <ScoreCard label="Skills Match" value={skillsMatch} />
        <ScoreCard label="Keywords" value={keywordsDensity} />
      </div>

      {/* Charts */}
      {Object.keys(sections).length > 0 && <SkillsChart sections={sections} />}

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Skills found ({skillsFound.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {skillsFound.length === 0 && <p className="text-xs text-gray-400">None detected</p>}
            {skillsFound.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md border border-green-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Missing skills ({skillsMissing.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {skillsMissing.length === 0 && <p className="text-xs text-gray-400">None identified</p>}
            {skillsMissing.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-md border border-red-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Strengths</h3>
          <ul className="space-y-2">
            {strengths.length === 0 && <li className="text-xs text-gray-400">—</li>}
            {strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Weaknesses</h3>
          <ul className="space-y-2">
            {weaknesses.length === 0 && <li className="text-xs text-gray-400">—</li>}
            {weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">!</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Language Issues - NEW */}
      {totalIssues > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Language Issues ({totalIssues})
          </h3>
          <div className="space-y-4">

            {/* Jargon */}
            {jargon.length > 0 && (
              <IssueGroup
                icon="💬"
                title="Jargon & Buzzwords"
                count={jargon.length}
                color="purple"
              >
                {jargon.map((item, i) => (
                  <div key={i} className="py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded">
                        {item.word}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">"{item.context}"</p>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="font-medium text-green-700">Fix:</span> {item.fix}
                    </p>
                  </div>
                ))}
              </IssueGroup>
            )}

            {/* Weak Verbs */}
            {weakVerbs.length > 0 && (
              <IssueGroup
                icon="💪"
                title="Weak Verbs"
                count={weakVerbs.length}
                color="amber"
              >
                {weakVerbs.map((item, i) => (
                  <div key={i} className="py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded line-through">
                        {item.word}
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">
                        {item.fix}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">"{item.context}"</p>
                  </div>
                ))}
              </IssueGroup>
            )}

            {/* Missing Metrics */}
            {missingMetrics.length > 0 && (
              <IssueGroup
                icon="📊"
                title="Missing Metrics"
                count={missingMetrics.length}
                color="blue"
              >
                {missingMetrics.map((item, i) => (
                  <div key={i} className="py-2.5 border-b border-gray-50 last:border-0">
                    <p className="text-xs text-gray-500 italic">"{item.sentence}"</p>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="font-medium text-blue-700">Better:</span> {item.fix}
                    </p>
                  </div>
                ))}
              </IssueGroup>
            )}

            {/* Grammar */}
            {grammar.length > 0 && (
              <IssueGroup
                icon="✏️"
                title="Grammar & Spelling"
                count={grammar.length}
                color="red"
              >
                {grammar.map((item, i) => (
                  <div key={i} className="py-2.5 border-b border-gray-50 last:border-0">
                    <p className="text-xs font-medium text-gray-700 mb-1">{item.issue}</p>
                    <p className="text-xs text-gray-500 italic">"{item.context}"</p>
                    <p className="text-xs text-gray-700 mt-1">
                      <span className="font-medium text-green-700">Fix:</span> {item.fix}
                    </p>
                  </div>
                ))}
              </IssueGroup>
            )}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Suggestions ({suggestions.length})</h3>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-l-3 ${
                  s.priority === "high"
                    ? "border-l-red-400 bg-red-50/40 border border-red-100"
                    : s.priority === "medium"
                    ? "border-l-amber-400 bg-amber-50/40 border border-amber-100"
                    : "border-l-blue-400 bg-blue-50/40 border border-blue-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${
                    s.priority === "high" ? "text-red-600" : s.priority === "medium" ? "text-amber-600" : "text-blue-600"
                  }`}>
                    {s.priority}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">{s.category}</span>
                </div>
                <p className="text-sm text-gray-800">{s.suggestion}</p>
                {s.example && (
                  <p className="text-xs text-gray-500 mt-2 pl-3 border-l-2 border-gray-200 italic">
                    {s.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "text-green-600" : value >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function IssueGroup({
  icon,
  title,
  count,
  color,
  children,
}: {
  icon: string;
  title: string;
  count: number;
  color: "purple" | "amber" | "blue" | "red";
  children: React.ReactNode;
}) {
  const borderColors = {
    purple: "border-purple-200",
    amber: "border-amber-200",
    blue: "border-blue-200",
    red: "border-red-200",
  };
  const bgColors = {
    purple: "bg-purple-50/30",
    amber: "bg-amber-50/30",
    blue: "bg-blue-50/30",
    red: "bg-red-50/30",
  };

  return (
    <details className={`rounded-lg border ${borderColors[color]} ${bgColors[color]} overflow-hidden`} open>
      <summary className="px-4 py-3 cursor-pointer flex items-center gap-2 hover:bg-white/40 transition-colors">
        <span>{icon}</span>
        <span className="text-sm font-medium text-gray-800">{title}</span>
        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{count}</span>
      </summary>
      <div className="px-4 pb-3">
        {children}
      </div>
    </details>
  );
}
