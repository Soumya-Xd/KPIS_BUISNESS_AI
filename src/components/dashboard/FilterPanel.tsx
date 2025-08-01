import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { ProjectData } from "@/lib/data";

interface FilterPanelProps {
  data: ProjectData[];
  onFilterChange: (filteredData: ProjectData[]) => void;
}

export function FilterPanel({ data, onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    team: '',
    techStack: '',
    deliveryStatus: '',
    customerName: '',
    dateFrom: '',
    dateTo: ''
  });

  const uniqueTeams = [...new Set(data.map(p => p.developmentTeamName))];
  const uniqueTechStacks = [...new Set(data.map(p => p.techStack))];
  const uniqueStatuses = [...new Set(data.map(p => p.deliveryStatus))];

  const applyFilters = () => {
    let filtered = data;

    if (filters.team) {
      filtered = filtered.filter(p => p.developmentTeamName === filters.team);
    }
    if (filters.techStack) {
      filtered = filtered.filter(p => p.techStack === filters.techStack);
    }
    if (filters.deliveryStatus) {
      filtered = filtered.filter(p => p.deliveryStatus === filters.deliveryStatus);
    }
    if (filters.customerName) {
      filtered = filtered.filter(p => 
        p.customerName.toLowerCase().includes(filters.customerName.toLowerCase())
      );
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setFilters({
      team: '',
      techStack: '',
      deliveryStatus: '',
      customerName: '',
      dateFrom: '',
      dateTo: ''
    });
    onFilterChange(data);
  };

  const removeFilter = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: '' }));
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== '');

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="team">Development Team</Label>
            <Select value={filters.team} onValueChange={(value) => setFilters(prev => ({ ...prev, team: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {uniqueTeams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="techStack">Tech Stack</Label>
            <Select value={filters.techStack} onValueChange={(value) => setFilters(prev => ({ ...prev, techStack: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select tech stack" />
              </SelectTrigger>
              <SelectContent>
                {uniqueTechStacks.map(tech => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deliveryStatus">Delivery Status</Label>
            <Select value={filters.deliveryStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, deliveryStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="Search customer..."
              value={filters.customerName}
              onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
            />
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key}: {value}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeFilter(key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}