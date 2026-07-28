import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CButton } from "@coreui/react";
import { getExploreUsers } from "../api/users";
import type { exploreUserEntry } from "../../util/types";
import { formatCents, formatRating } from "../../util/format";
import StarRating from "../components/StarRating";
import LoadingScreen from "./loading";

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "username", label: "Username (A–Z)" },
  { value: "rating", label: "Rating" },
  { value: "transactions", label: "Transactions" },
  { value: "volume", label: "Volume" },
];

function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<exploreUserEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "relevance";
  const page = Number(searchParams.get("page") ?? "1");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getExploreUsers({ search, sort, page });
      setResults(data?.data ?? []);
      setTotalPages(data?.totalPages ?? 1);
      setLoading(false);
    }

    void load();
  }, [search, sort, page]);

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  }

  if (loading) {
    return <LoadingScreen details="Loading explore directory..." />;
  }

  return (
    <div className="rtp-page">
      <h1 className="h3 mb-1">Explore developers</h1>
      <p className="text-muted mb-3">
        Browse verified users, sorted by reputation and activity.
      </p>

      <form
        className="explore-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          updateParams({
            search: String(formData.get("search") ?? ""),
            sort: String(formData.get("sort") ?? "relevance"),
            page: "1",
          });
        }}
      >
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by username or Roblox user ID"
        />
        <select name="sort" defaultValue={sort}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <CButton type="submit" color="primary">
          Search
        </CButton>
      </form>

      <div className="rtp-card">
        <div className="user-row user-row-header">
          <div>User</div>
          <div>Rating</div>
          <div>Transactions</div>
          <div>Volume</div>
          <div />
        </div>

        {results.length === 0 ? (
          <p className="text-muted mb-0 py-3">No users matched your search.</p>
        ) : (
          results.map((entry) => (
            <div className="user-row" key={entry.rblxUserID}>
              <div>
                <Link to={`/users/${entry.rblxUserID}`} className="fw-semibold">
                  {entry.robloxUsername}
                </Link>
                <div className="small text-muted">ID {entry.rblxUserID}</div>
              </div>
              <div>
                <StarRating rating={entry.averageRating} />{" "}
                <span className="small text-muted">
                  ({formatRating(entry.averageRating)})
                </span>
              </div>
              <div>{entry.transactionCount}</div>
              <div>{formatCents(entry.volume)}</div>
              <div>
                <CButton
                  as={Link}
                  to={`/users/${entry.rblxUserID}`}
                  color="primary"
                  variant="outline"
                  size="sm"
                >
                  Profile
                </CButton>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <CButton
          color="secondary"
          variant="outline"
          disabled={page <= 1}
          onClick={() => updateParams({ page: String(page - 1) })}
        >
          Previous
        </CButton>
        <span className="text-muted">
          Page {page} of {totalPages}
        </span>
        <CButton
          color="secondary"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => updateParams({ page: String(page + 1) })}
        >
          Next
        </CButton>
      </div>
    </div>
  );
}

export default ExplorePage;
