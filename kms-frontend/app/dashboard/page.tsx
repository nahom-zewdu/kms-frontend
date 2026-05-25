// app/dashboard/page.tsx
// This is the main dashboard page for the KMS frontend application. It serves as the landing page for users when they navigate to the dashboard section.
// The page displays an overview of key metrics such as active onboardings and knowledge health, providing users with a quick snapshot of the current state of their knowledge management system.
// The dashboard is designed to be visually appealing and easy to navigate, with a clean layout and clear typography. 
// It uses Tailwind CSS for styling and is structured to allow for easy expansion in the future as more features and metrics are added to the dashboard. 
// By providing users with an at-a-glance view of important information, the dashboard helps them stay informed and make data-driven decisions about their knowledge management practices.
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tighter mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-3xl p-8">
          <h2 className="text-xl font-medium mb-4">Active Onboardings</h2>
          <p className="text-zinc-400">3 new hires currently onboarding</p>
        </div>
        <div className="bg-zinc-900 rounded-3xl p-8">
          <h2 className="text-xl font-medium mb-4">Knowledge Health</h2>
          <p className="text-zinc-400">Bus factor average: 1.8</p>
        </div>
      </div>
    </div>
  );
}