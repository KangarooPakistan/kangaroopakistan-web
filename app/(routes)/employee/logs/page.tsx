"use client";

import Timeline from "@/app/components/Timeline";
import SearchBar from "@/app/components/SearchBar";
import Pagination from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface LogsResponse {
  data: any[];
  pagination: PaginationInfo;
}

const Logs = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async (page: number = 1, search: string = "", limit: number = 10) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      
      const response = await axios.get(`/api/updates?${params.toString()}`);
      const data: LogsResponse = response.data;
      
      setUpdates(data.data);
      setPagination(data.pagination);
      setCurrentPage(data.pagination.currentPage);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setUpdates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, searchTerm, pageSize);
  }, [fetchData, searchTerm, pageSize]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    fetchData(page, searchTerm, pageSize);
  }, [fetchData, searchTerm, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchData(currentPage, searchTerm, pageSize);
  };

  return (
    <>
      <div className="container bg-zinc-50 mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-6">Activity Logs</h1>
          
          {/* Controls Section */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search by school, email, contest, or description..."
                className="flex-1 max-w-md"
              />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="pageSize" className="text-sm font-medium">
                    Show:
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
                
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {updates.length} of {pagination.totalCount} logs
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg">Loading logs...</div>
          </div>
        ) : updates.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-500">
              {searchTerm ? "No logs found matching your search." : "No logs available."}
            </div>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <Timeline events={updates} />
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Logs;