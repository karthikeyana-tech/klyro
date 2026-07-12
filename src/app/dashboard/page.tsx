"use client";

import { useAppStore } from "@/lib/store";
import { formatDate, getScoreColor, getScoreLabel } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const { analysisHistory, setCurrentAnalysis } = useAppStore();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {analysisHistory.length} {analysisHistory.length === 1 ? "analysis" : "analyses"}
          </p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          New Analysis
        </Link>
      </div>

      {analysisHistory.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No analyses yet</p>
          <Link href="/" className="text-sm text-primary-600 hover:underline">
            Upload your first resume →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {analysisHistory.map((analysis, index) => (
            <Link
              key={analysis.id || index}
              href="/results"
              onClick={() => setCurrentAnalysis(analysis)}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                  {analysis.fileName || "Resume"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {analysis.jobTitle || "General"} • {analysis.createdAt ? formatDate(analysis.createdAt) : "Just now"}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getScoreColor(analysis.atsScore)}`}>
                  {analysis.atsScore}
                </p>
                <p className="text-[11px] text-gray-400">{getScoreLabel(analysis.atsScore)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
