import { useState, useEffect } from "react";
import {
  fetchArchivedClaims,
  filterArchivedClaims,
  unarchiveClaim,
} from "../../AdminActions/ClaimsArchiveActions";

export default function ClaimsArchiveController() {
  // ✅ Hook logic must live inside a valid React component/hook
  const useController = () => {
    const [archivedClaims, setArchivedClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const loadClaims = async () => {
      setLoading(true);
      try {
        const { claims, totalCount } = await fetchArchivedClaims(
          currentPage,
          rowsPerPage
        );
        setArchivedClaims(claims);
        setTotalPages(Math.ceil(totalCount / rowsPerPage));
      } catch (err) {
        console.error("Error loading claims:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadClaims();
    }, [currentPage, rowsPerPage]);

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const handleUnarchive = async (claimId) => {
      try {
        await unarchiveClaim(claimId);
        loadClaims();
      } catch (err) {
        console.error("Error unarchiving claim:", err);
      }
    };

    const handleRefresh = () => {
      loadClaims();
    };

    const filteredClaims = filterArchivedClaims(archivedClaims, null, searchTerm);

    return {
      archivedClaims: filteredClaims,
      loading,
      searchTerm,
      setSearchTerm,
      handleUnarchive,
      handleRefresh,
      currentPage,
      totalPages,
      handlePageChange,
      rowsPerPage,
      setRowsPerPage,
    };
  };

  return useController(); // ✅ this makes it safe to call as a plain function
}
