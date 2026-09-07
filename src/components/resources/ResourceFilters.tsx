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
}

export function ResourceFilters({ category, setCategory }: ResourceFiltersProps) {
  return (
    <div className="w-full max-w-xs space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Filters</h2>
        <Button variant="link" className="text-primary h-auto p-0 text-sm">
          Reset All
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Faculty</Label>
          <Select defaultValue="engineering">
            <SelectTrigger className="bg-background/50 border-border">
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
          <Select defaultValue="cse">
            <SelectTrigger className="bg-background/50 border-border">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cse">Computer Science & Engineering</SelectItem>
              <SelectItem value="me">Mechanical Engineering</SelectItem>
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
          <Label className="text-muted-foreground text-sm">Session</Label>
          <Select defaultValue="2023-2024">
            <SelectTrigger className="bg-background/50 border-border">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023-2024">2023/2024</SelectItem>
              <SelectItem value="2022-2023">2022/2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Lecturer</Label>
          <Select defaultValue="adegoke">
            <SelectTrigger className="bg-background/50 border-border">
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
