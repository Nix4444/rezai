"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

// Mock data for analytics - in a real app, this would come from an API
const templateData = [
  { name: 'Default', value: 42, color: '#0088FE' },
  { name: 'Modern', value: 65, color: '#00C49F' },
  { name: 'Classic', value: 37, color: '#FFBB28' },
];

const userGrowthData = [
  { name: 'Jan', users: 40 },
  { name: 'Feb', users: 68 },
  { name: 'Mar', users: 95 },
  { name: 'Apr', users: 124 },
  { name: 'May', users: 176 },
  { name: 'Jun', users: 207 },
];

const resumesByDayData = [
  { name: 'Mon', resumes: 12 },
  { name: 'Tue', resumes: 19 },
  { name: 'Wed', resumes: 23 },
  { name: 'Thu', resumes: 17 },
  { name: 'Fri', resumes: 24 },
  { name: 'Sat', resumes: 10 },
  { name: 'Sun', resumes: 8 },
];

const commonErrorsData = [
  { name: 'Missing Skills', count: 35 },
  { name: 'Incomplete Work History', count: 28 },
  { name: 'No Contact Info', count: 14 },
  { name: 'Poor Formatting', count: 21 },
  { name: 'Spelling Errors', count: 19 },
];

// Define User interface
interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  credits: number;
  createdAt: string;
}

// Mock user data - in a real app, this would come from an API call
const mockUsers: User[] = [];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserManager, setShowUserManager] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditInput, setCreditInput] = useState({
    username: '',
    credits: 1
  });
  const [usernameError, setUsernameError] = useState('');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const userRole = session?.user?.role as string | undefined;
    
    if (status === "authenticated" && userRole !== "ADMIN") {
      setAuthError(true);
      router.push("/");
    }
    
    if (status === "unauthenticated") {
      setAuthError(true);
      router.push("/");
    }

    if (status === "authenticated" && userRole === "ADMIN") {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddCredits = async () => {
    // Validate username is provided
    if (!creditInput.username.trim()) {
      setUsernameError('Username is required');
      return;
    }

    try {
      // Make API call to add credits
      const response = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: creditInput.username,
          credits: creditInput.credits,
        }),
      });

      if (response.ok) {
        // Success - refresh users list
        fetchUsers();
        
        // Reset form and show success message
        setCreditInput({ username: '', credits: 1 });
        setUsernameError('');
        alert(`Successfully added ${creditInput.credits} credits to ${creditInput.username}`);
      } else {
        // Handle error response
        const errorData = await response.json();
        setUsernameError(errorData.error || 'Failed to allocate credits');
      }
    } catch (error) {
      console.error('Error allocating credits:', error);
      setUsernameError('An error occurred. Please try again.');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchTermLower) ||
      user.username.toLowerCase().includes(searchTermLower)
    );
  });

  if (status === "loading" || authError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-2">{authError ? "Access Denied" : "Loading..."}</p>
          {authError && (
            <p className="text-sm text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
          )}
          {authError && (
            <button 
              onClick={() => router.push("/")}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Resumes" value="148" icon="📄" change="+12%" />
            <StatCard title="Total Users" value="276" icon="👥" change="+8%" />
            <StatCard title="Templates Used" value="3" icon="📋" change="0%" />
          </div>
        );
      case 'resumeAnalytics':
        return <ResumeAnalytics />;
      case 'userEngagement':
        return <UserEngagement />;
      case 'errors':
        return <ErrorAnalysis />;
      default:
        return null;
    }
  };

  // Create datalist options for username autocomplete
  const usernameOptions = users.map(user => (
    <option key={user.id} value={user.username} />
  ));

  return (
    <div className="bg-[#212121] container mx-auto p-6 text-white">
      <div className="bg-[#333333] rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="flex justify-center">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded flex items-center justify-center w-full max-w-xs mx-auto"
            onClick={() => setShowUserManager(true)}
          >
            <span className="mr-2">👥</span> Manage Users
          </button>
        </div>
      </div>
      
      {/* Credit Allocation Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#333333] rounded-lg shadow-xl max-w-md w-full p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Allocate Credits</h3>
              <button 
                onClick={() => {
                  setShowCreditModal(false);
                  setCreditInput({ username: '', credits: 1 });
                  setUsernameError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${usernameError ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter username"
                  value={creditInput.username}
                  onChange={(e) => {
                    setCreditInput({...creditInput, username: e.target.value});
                    setUsernameError('');
                  }}
                  list="username-list"
                />
                <datalist id="username-list">
                  {usernameOptions}
                </datalist>
              </div>
              {usernameError && (
                <p className="text-red-500 text-xs mt-1">{usernameError}</p>
              )}
            </div>
            
            <div className="mb-8">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="credits">
                Credits to Allocate
              </label>
              <div className="flex items-center">
                <div className="flex items-center border rounded-md">
                  <button 
                    className="px-3 py-1 border-r"
                    onClick={() => setCreditInput({...creditInput, credits: Math.max(1, creditInput.credits - 1)})}
                  >
                    -
                  </button>
                  <input
                    id="credits"
                    type="number"
                    min="1"
                    className="w-16 text-center py-1 focus:outline-none"
                    value={creditInput.credits}
                    onChange={(e) => setCreditInput({...creditInput, credits: Math.max(1, parseInt(e.target.value) || 1)})}
                  />
                  <button 
                    className="px-3 py-1 border-l"
                    onClick={() => setCreditInput({...creditInput, credits: creditInput.credits + 1})}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                onClick={() => {
                  setShowCreditModal(false);
                  setCreditInput({ username: '', credits: 1 });
                  setUsernameError('');
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                onClick={handleAddCredits}
              >
                Allocate Credits
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* User Management Modal */}
      {showUserManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#333333] rounded-lg shadow-xl max-w-md w-full p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Manage Users</h2>
              <button
                onClick={() => setShowUserManager(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manage-username">
                Username
              </label>
              <div className="relative">
                <input
                  id="manage-username"
                  type="text"
                  className={`w-full text-white px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${usernameError ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter username"
                  value={creditInput.username}
                  onChange={(e) => {
                    setCreditInput({...creditInput, username: e.target.value});
                    setUsernameError('');
                  }}
                />
              </div>
              {usernameError && (
                <p className="text-red-500 text-xs mt-1">{usernameError}</p>
              )}
            </div>
            
            <div className="mb-6 text-white">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="manage-credits">
                Credits to Allocate
              </label>
              <div className="flex items-center">
                <div className="flex items-center border rounded-md">
                  <button 
                    className="px-3 py-1 border-r"
                    onClick={() => setCreditInput({...creditInput, credits: Math.max(1, creditInput.credits - 1)})}
                  >
                    -
                  </button>
                  <input
                    id="manage-credits"
                    type="number"
                    min="1"
                    className="w-16 text-center py-1 focus:outline-none"
                    value={creditInput.credits}
                    onChange={(e) => setCreditInput({...creditInput, credits: Math.max(1, parseInt(e.target.value) || 1)})}
                  />
                  <button 
                    className="px-3 py-1 border-l"
                    onClick={() => setCreditInput({...creditInput, credits: creditInput.credits + 1})}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                onClick={() => {
                  setShowUserManager(false);
                  setCreditInput({ username: '', credits: 1 });
                  setUsernameError('');
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                onClick={handleAddCredits}
              >
                Allocate Credits
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-[#333333] rounded-lg shadow-md p-6 mb-8">
        <nav className="flex border-b mb-6">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'resumeAnalytics' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
            onClick={() => setActiveTab('resumeAnalytics')}
          >
            Resume Analytics
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'userEngagement' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
            onClick={() => setActiveTab('userEngagement')}
          >
            User Engagement
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'errors' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
            onClick={() => setActiveTab('errors')}
          >
            Common Errors
          </button>
        </nav>
        
        {renderTabContent()}
      </div>
      
      <div className="p-6 bg-[#333333] rounded-lg shadow-md text-white">
        <h2 className="text-xl font-semibold mb-4">Admin Information</h2>
        <p className="mb-2">
          <span className="font-medium">Email:</span> {session?.user?.email}
        </p>
        <p className="mb-2">
          <span className="font-medium">Role:</span> {session?.user?.role as string}
        </p>
      </div>
    </div>
  );
}

// Component for overview stats cards
interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  change: string;
}

const StatCard = ({ title, value, icon, change }: StatCardProps) => {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-[#333333] rounded-lg shadow p-6 border border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className={`mt-4 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {change} from last month
      </div>
    </div>
  );
};

// Component for resume analytics tab
const ResumeAnalytics = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-[#333333] rounded-lg shadow p-6 border border-gray-700 text-white">
        <h3 className="text-lg font-semibold mb-4">Templates Usage</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={templateData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {templateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#333333] rounded-lg shadow p-6 border border-gray-700 text-white">
        <h3 className="text-lg font-semibold mb-4">Resumes by Day of Week</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resumesByDayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="resumes" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#333333] text-white rounded-lg shadow p-6 border border-gray-700 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Resume Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Average Sections</p>
            <p className="text-xl font-bold">6.2</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg. Skills Listed</p>
            <p className="text-xl font-bold">8.4</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg. Experience Items</p>
            <p className="text-xl font-bold">3.7</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">PDF Downloads</p>
            <p className="text-xl font-bold">128</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for user engagement tab
const UserEngagement = () => {
  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-[#333333] rounded-lg shadow p-6 border border-gray-700 text-white">
        <h3 className="text-lg font-semibold mb-4">User Growth</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#333333] rounded-lg shadow p-6 border border-gray-700 text-white">
        <h3 className="text-lg font-semibold mb-4">User Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Avg. Session Time</p>
            <p className="text-xl font-bold">12.4 minutes</p>
            <p className="text-xs text-green-500 mt-1">+8% from last month</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Return Rate</p>
            <p className="text-xl font-bold">68%</p>
            <p className="text-xs text-green-500 mt-1">+5% from last month</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-xl font-bold">74%</p>
            <p className="text-xs text-red-500 mt-1">-2% from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for common errors tab
const ErrorAnalysis = () => {
  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-[#333333] rounded-lg shadow p-6 border border-gray-700 text-white">
        <h3 className="text-lg font-semibold mb-4">Common Resume Errors</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={commonErrorsData}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-[#333333] rounded-lg shadow p-6 border border-gray-700 text-white">
        <h3 className="text-lg font-semibold mb-4">Error Resolution Tips</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium">Missing Skills</h4>
            <p className="text-sm mt-1">Remind users to include relevant technical and soft skills that match job requirements.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium">Incomplete Work History</h4>
            <p className="text-sm mt-1">Encourage users to provide dates, company names, and detailed responsibilities for each position.</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium">Poor Formatting</h4>
            <p className="text-sm mt-1">Suggest using consistent formatting for headers, bullet points, and spacing throughout the resume.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium">Spelling Errors</h4>
            <p className="text-sm mt-1">Recommend proofreading the final document or using spell-check tools before downloading.</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 