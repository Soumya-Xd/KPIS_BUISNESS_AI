import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectData } from "@/lib/data";
import { Search } from "lucide-react";

interface ProjectTableProps {
  data: ProjectData[];
}

export function ProjectTable({ data }: ProjectTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter(project =>
    Object.values(project).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    const variants = {
      'On Time': 'default',
      'Delayed': 'destructive',
      'In Progress': 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Project Details
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tech Stack</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Developers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((project) => (
                <TableRow key={project.projectId}>
                  <TableCell className="font-medium">
                    {project.projectId}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.customerAddress}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a 
                      href={`https://${project.websiteName}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {project.websiteName}
                    </a>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(project.projectPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{project.techStack}</Badge>
                  </TableCell>
                  <TableCell>{project.developmentTeamName}</TableCell>
                  <TableCell>
                    {getStatusBadge(project.deliveryStatus)}
                  </TableCell>
                  <TableCell>{project.deliveryDate}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{project.developersNeeded} needed</div>
                      <div className="text-muted-foreground truncate max-w-32">
                        {project.assignedDevelopers}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} projects
            </div>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}