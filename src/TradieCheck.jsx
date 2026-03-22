import { useTradieSearch } from "./hooks/useTradieSearch";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import LogoutButton from "./components/LogoutButton";
import "./TradieCheck.css";

export default function TradieCheck() {
  const {
    query, setQuery,
    loading,
    results,
    result,
    notFound, setNotFound,
    inputRef,
    handleSearch,
    handleSelect,
    resetAll,
    resetToList,
  } = useTradieSearch();

  const hasResults = loading || !!results || !!result || notFound;

  const handleRetry = () => {
    setNotFound(false);
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      color: "#fff",
    }}>
      {/* Fixed logout button */}
      <div style={{ position: "fixed", top: "16px", right: "20px", zIndex: 100 }}>
        <LogoutButton variant="dark" />
      </div>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(0,232,122,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,122,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: "-200px", left: "25%",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse, rgba(0,232,122,0.06) 0%, transparent 70%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div className={`tc-layout${hasResults ? " tc-has-results" : ""}`}>
        <LeftPanel
          query={query}
          setQuery={setQuery}
          loading={loading}
          onSearch={handleSearch}
          inputRef={inputRef}
        />
        <RightPanel
          loading={loading}
          results={results}
          result={result}
          notFound={notFound}
          query={query}
          onSelect={(licence) => handleSelect(licence)}
          onBack={resetToList}
          onReset={resetAll}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}
