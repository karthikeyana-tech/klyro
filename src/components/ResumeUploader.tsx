"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const { isAnalyzing, setIsAnalyzing, setCurrentAnalysis, addToHistory } = useAppStore();
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile && pdfFile.type === "application/pdf") {
      setFile(pdfFile);
    } else {
      toast.error("Please upload a PDF file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Upload a resume first");
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jobTitle) formData.append("jobTitle", jobTitle);
      if (jobDescription) formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed");
      }

      setCurrentAnalysis(result.data);
      addToHistory(result.data);
      toast.success("Done!");
      router.push("/results");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Try again.";
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
          ${isDragActive
            ? "border-primary-400 bg-primary-50"
            : file
              ? "border-green-300 bg-green-50/50"
              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
          }
        `}
      >
        <input {...getInputProps()} />

        {file ? (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-md mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {file.name}
            </div>
            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB • Click to replace</p>
          </div>
        ) : (
          <div>
            <svg className="w-8 h-8 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-gray-600">
              {isDragActive ? "Drop it here" : "Drop your resume PDF here"}
            </p>
            <p className="text-xs text-gray-400 mt-1">or click to browse • PDF only • 5MB max</p>
          </div>
        )}
      </div>

      {/* Optional: Job Description */}
      <details className="group">
        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 select-none">
          + Add a job description for targeted analysis
        </summary>
        <div className="mt-3 space-y-3">
          <input
            type="text"
            placeholder="Job title (e.g. Backend Developer)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
          />
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 resize-none"
          />
        </div>
      </details>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || isAnalyzing}
        className={`
          w-full py-3 rounded-lg text-sm font-semibold transition-all
          ${!file || isAnalyzing
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.99] shadow-sm"
          }
        `}
      >
        {isAnalyzing ? (
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          "Analyze Resume"
        )}
      </button>
    </div>
  );
}
