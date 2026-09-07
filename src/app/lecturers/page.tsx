"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layouts/Navbar';
import { VerifiedCard } from '@/components/ui/verified-card';
import { useLecturers } from '@/hooks/useLecturers';
import { Search, GraduationCap, Building2, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Simulated standard departments for the filter dropdown
const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Food Science',
  'Agricultural Engineering',
  'Mechanical Engineering',
  'Cybersecurity'
];

export default function LecturerDirectoryPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'department'>('title');
  const [department, setDepartment] = useState('All');

  // Debounce the search input to avoid hitting the API on every single keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: lecturers, isLoading, isError } = useLecturers(debouncedSearch, sortBy, department);
  console.log(lecturers);
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground font-mono tracking-tight flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              Academic Directory
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Search and browse LAUTECH lecturers. Titles and prefixes are integrated into names—sorting by title automatically groups professors, doctors, and misters together.
            </p>
          </div>

          {/* Controls (Search, Sort, Filter) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by lecturer name (e.g. Obe, Adegoke)..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
            
            <div className="md:col-span-3 flex items-center bg-card border border-border rounded-md px-3 relative">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-2" />
              <select 
                className="w-full bg-transparent text-sm text-foreground outline-none appearance-none py-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'department')}
              >
                <option value="title" className="bg-background">Sort by Title/Name</option>
                <option value="department" className="bg-background">Sort by Department</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-center bg-card border border-border rounded-md px-3 relative">
              <Building2 className="h-4 w-4 text-muted-foreground mr-2" />
              <select 
                className="w-full bg-transparent text-sm text-foreground outline-none appearance-none py-2"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept} className="bg-background">{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data Grid */}
          {isError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
              Failed to load the directory. Please try again later.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 rounded-lg bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : lecturers?.length === 0 ? (
            <VerifiedCard className="p-12 text-center border-dashed border-border">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground">No lecturers found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or department filters.</p>
            </VerifiedCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lecturers?.map((lecturer) => (
                <Link href={`/lecturers/${lecturer._id}`} key={lecturer._id} className="block group">
                  <VerifiedCard 
                    className="p-5 border-border transition-all hover:border-primary/50 hover:shadow-[0_0_15px_rgba(78,222,163,0.1)] h-full flex flex-col justify-between"
                    isVerified={lecturer.isVerified}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {lecturer.name}
                        </h3>
                        {lecturer.isVerified && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{lecturer.department}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border/50 text-xs font-mono text-secondary group-hover:text-primary transition-colors">
                      View Academic Profile →
                    </div>
                  </VerifiedCard>
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  );
}