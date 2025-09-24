import Sidebar from "@/components/layout/sidebar";
import FlaggedCasesTable from "@/components/flagged-cases-table";

export default function FlaggedCases() {
  return (
    <div className="min-h-screen flex bg-background" data-testid="flagged-cases-page">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4" data-testid="flagged-cases-header">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Flagged Cases - Admin Review</h2>
            <p className="text-sm text-muted-foreground">Review and approve or reject worker assessments flagged by AI</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto" data-testid="flagged-cases-content">
          <div className="max-w-7xl mx-auto">
            <FlaggedCasesTable showAllCases={true} />
          </div>
        </main>
      </div>
    </div>
  );
}
