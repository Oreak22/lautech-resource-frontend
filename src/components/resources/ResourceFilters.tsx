"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ResourceFiltersProps {
  category?: string;
  setCategory: (c: string | undefined) => void;
  department?: string;
  departments: string[];
  setDepartment: (department: string | undefined) => void;
  level?: string;
  levels: string[];
  setLevel: (level: string | undefined) => void;
  semester?: "first" | "second";
  setSemester: (semester: "first" | "second" | undefined) => void;
}

export function ResourceFilters({
  category,
  setCategory,
  department,
  departments,
  setDepartment,
  level,
  levels,
  setLevel,
  semester,
  setSemester,
}: ResourceFiltersProps) {
  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="flex items-center justify-between pr-9 md:pr-0">
        <h2 className="text-xl font-semibold">Filters</h2>
        <Button
          variant="link"
          className="text-primary h-auto p-0 text-sm"
          onClick={() => {
            setCategory(undefined);
            setDepartment(undefined);
            setLevel(undefined);
            setSemester(undefined);
          }}
        >
          Reset All
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Faculty</Label>
          <Select defaultValue="engineering">
            <SelectTrigger className="w-full bg-background/50 border-border">
              <SelectValue placeholder="Select faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineering">Engineering & Tech</SelectItem>
              <SelectItem value="science">Pure & Applied Science</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Department</Label>
          <Select
            value={department ?? "all"}
            onValueChange={(value) =>
              setDepartment(value === "all" ? undefined : (value ?? undefined))
            }
          >
            <SelectTrigger className="w-full bg-background/50 border-border">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground text-sm">Category</Label>
          <div className="space-y-2">
            {["Past Question", "Handout", "Textbook", "Project Report"].map((cat) => (
              <div className="flex items-center space-x-2" key={cat}>
                <Checkbox 
                  id={cat} 
                  checked={category === cat}
                  onCheckedChange={(checked) => setCategory(checked ? cat : undefined)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-border" 
                />
                <Label htmlFor={cat} className="font-normal">{cat}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Level</Label>
          <Select
            value={level ?? "all"}
            onValueChange={(value) =>
              setLevel(value === "all" ? undefined : (value ?? undefined))
            }
          >
            <SelectTrigger className="w-full bg-background/50 border-border">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((item) => (
                <SelectItem key={item} value={item}>
                  {item} Level
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Semester</Label>
          <Select
            value={semester ?? "all"}
            onValueChange={(value) =>
              setSemester(
                value === "all"
                  ? undefined
                  : (value as "first" | "second" | null) ?? undefined,
              )
            }
          >
            <SelectTrigger className="w-full bg-background/50 border-border">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="first">First Semester (odd codes)</SelectItem>
              <SelectItem value="second">Second Semester (even codes)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Lecturer</Label>
          <Select defaultValue="adegoke">
            <SelectTrigger className="w-full bg-background/50 border-border">
              <SelectValue placeholder="Select lecturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adegoke">Dr. Adegoke</SelectItem>
              <SelectItem value="olayinka">Prof. Olayinka</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
