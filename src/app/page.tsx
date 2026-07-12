"use client";

import Image from "next/image";
import ResumeUploader from "@/components/ResumeUploader";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-16">
        {/* Logo + Text */}
        <div className="text-center mb-8">
          <Image
            src="/logo2.png"
            alt="Klyro"
            width={112}
            height={112}
            className="w-28 h-28 object-contain mx-auto mb-8"
            priority
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Is your resume getting{" "}
            <span className="text-primary-600">ignored by ATS?</span>
          </h1>
          <p className="mt-3 text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            Upload your resume. Get an instant compatibility score, find missing keywords,
            and see exactly what to fix.
          </p>
        </div>

        {/* Upload */}
        <ResumeUploader />
      </section>
    </div>
  );
}
