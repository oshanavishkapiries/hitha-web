"use client";

import React, { useState, useEffect, useMemo } from "react";
import AppShell from "../../components/AppShell";
import { useBlogs } from "../../lib/service/query/useBlog";
import { navigateTo } from "../../utils/navigation";
import { Search, BookOpen, Clock, ShieldAlert, Loader2 } from "lucide-react";

const HERO_BG_IMAGE = "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1600&auto=format&fit=crop";

const SUGGESTED_TOPICS = [
  "All",
  "Mental Wellness",
  "Clinical Care",
  "Anxiety",
  "Depression",
  "Self-Care",
  "Therapy",
  "Platform Security"
];

export default function BlogDirectoryPage() {
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const apiParams = useMemo(() => {
    return {
      status: "PUBLISHED" as const,
      search: debouncedSearch || undefined,
      topic: selectedTopic === "All" ? undefined : selectedTopic,
      size: 50, // Retrieve a larger batch for directory browsing
    };
  }, [debouncedSearch, selectedTopic]);

  const { data: blogs, isLoading, isError } = useBlogs(apiParams);

  return (
    <AppShell>
      <div className="bg-cream min-h-screen">
        {/* Serene Banner Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-ink to-forest text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <img
              src={HERO_BG_IMAGE}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top opacity-15 mix-blend-luminosity"
              style={{
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)",
              }}
            />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-mint rounded-full filter blur-[120px] opacity-10" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sprout rounded-full filter blur-[100px] opacity-10" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-xs font-sans font-bold text-sprout/80 uppercase tracking-wider">
              <span>Hitha Wellness Library</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
              Healing through Understanding
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-sprout/80 max-w-2xl mx-auto leading-relaxed">
              Explore trilingual wellness insights, mental health guides, and platform tutorials authored directly by our accredited specialists and clinical advisory panels.
            </p>
          </div>
        </section>

        {/* Directory Filters Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Real-time Title/Content Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sprout/60 w-4 h-4" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search articles by title or keyword..."
                className="w-full bg-white border border-hairline focus:border-forest/50 focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-ink text-sm outline-none transition-all placeholder:text-ink-soft/40 font-sans shadow-resting"
              />
            </div>

            {/* Quick Topic Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <span className="text-xs font-sans font-bold text-ink-soft shrink-0 mr-2 uppercase tracking-wider">Topics:</span>
              <div className="flex gap-1.5">
                {SUGGESTED_TOPICS.map((topic) => {
                  const isActive = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`text-xs px-4 py-2 rounded-full border transition-all cursor-pointer font-sans font-semibold shrink-0 ${
                        isActive
                          ? "bg-forest border-forest text-white shadow-resting"
                          : "bg-white border-hairline text-ink-soft hover:border-forest/30 hover:bg-cream/40"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Directory Content Area */}
          <div className="pt-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3 text-ink-soft">
                <Loader2 className="w-8 h-8 animate-spin text-forest" />
                <p className="text-xs font-sans font-medium">Loading articles...</p>
              </div>
            ) : isError ? (
              <div className="bg-[#F4E2DD] border border-clay/20 rounded-card p-10 text-center space-y-4 max-w-xl mx-auto">
                <ShieldAlert className="w-12 h-12 text-clay mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-lg text-clay">Unable to load Wellness Library</h3>
                  <p className="text-xs text-ink-soft leading-relaxed max-w-md mx-auto">
                    There was a problem pulling articles from the database. Please reload or check back in a few minutes.
                  </p>
                </div>
              </div>
            ) : !blogs || blogs.length === 0 ? (
              <div className="bg-white border border-hairline rounded-3xl p-16 text-center space-y-4 max-w-xl mx-auto shadow-resting">
                <BookOpen className="w-12 h-12 text-sprout mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-forest text-lg">No Articles Found</h3>
                  <p className="text-xs text-ink-soft leading-relaxed max-w-sm mx-auto">
                    We couldn't find any articles matching your search criteria. Try modifying your search term or selecting "All" topics.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchVal("");
                    setSelectedTopic("All");
                  }}
                  className="bg-forest hover:bg-forest/90 text-white font-sans font-semibold text-xs px-5 py-2.5 rounded-full transition-all shadow-resting"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog: any) => {
                  // Rough estimation of reading time: ~200 words per minute
                  let readTimeMin = 3;
                  try {
                    const rawBlocks = blog.content ? JSON.parse(blog.content || "{}").blocks : [];
                    const textLength = (rawBlocks || []).reduce((acc: number, curr: any) => acc + (curr.data?.text?.length || 0), 0);
                    readTimeMin = Math.max(1, Math.ceil(textLength / 1000)); // Approx 1000 chars per min
                  } catch (e) {
                    // Ignore parsing error
                  }

                  return (
                    <button
                      key={blog.id}
                      type="button"
                      onClick={() => navigateTo(`/blog/${blog.id}`)}
                      className="group bg-white border border-hairline hover:border-forest/30 shadow-resting hover:shadow-elevated rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col text-left outline-none"
                    >
                      {/* Thumbnail Focused Card Top */}
                      <div className="relative w-full aspect-video bg-cream overflow-hidden border-b border-hairline shrink-0">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-sprout" />
                          </div>
                        )}
                        {/* Primary Topic Badge */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-sprout/60 bg-cream/90 text-forest shadow-sm">
                            {blog.topics?.[0] || "General"}
                          </span>
                        </div>
                      </div>

                      {/* Card Bottom Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-display font-bold text-forest text-base line-clamp-2 leading-snug group-hover:text-forest-hover transition-colors">
                            {blog.title}
                          </h3>
                          <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                            {blog.summary || "Click to open and read full article contents on mental wellbeing, safety, and healthcare."}
                          </p>
                        </div>

                        {/* Author metadata footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-hairline/60 text-[10px] font-sans font-medium text-ink-faint">
                          <div className="flex items-center space-x-2">
                            {blog.author?.profilePicture && (
                              <img
                                src={blog.author.profilePicture}
                                alt={blog.author.name}
                                className="w-5 h-5 rounded-full object-cover border border-hairline"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <span>By <span className="font-semibold text-ink-soft">{blog.author?.name || "Hitha Contributor"}</span></span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <Clock className="w-3 h-3 text-moss" />
                            <span>{readTimeMin} min read</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
