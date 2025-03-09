export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <nav>
            <ul className="flex space-x-6">
              <li className="hover:text-blue-200">Dashboard</li>
              <li className="hover:text-blue-200">Users</li>
              <li className="hover:text-blue-200">Settings</li>
            </ul>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 