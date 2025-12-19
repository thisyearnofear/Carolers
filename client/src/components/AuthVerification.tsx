// MODULAR: Authentication verification component for testing
import { useAppUser } from '@/lib/auth';
import { Button } from './ui/button';
import { User, LogIn, LogOut, Check, X, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';

export function AuthVerification() {
  const { user, isLoading, signOut } = useAppUser();

  // CLEAN: Authentication status checks
  const checks = [
    {
      name: 'Clerk Provider Initialized',
      status: !isLoading ? '✅' : 'ℹ️ ',
      icon: !isLoading ? <Check className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      description: !isLoading ? 'Clerk provider is ready' : 'Initializing...',
    },
    {
      name: 'User Authentication',
      status: user ? '✅' : '❌',
      icon: user ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />,
      description: user ? `Authenticated as ${user.name}` : 'No authenticated user',
    },
    {
      name: 'User Data Available',
      status: user && user.id ? '✅' : '❌',
      icon: user && user.id ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />,
      description: user && user.id ? `User ID: ${user.id}` : 'User data incomplete',
    },
    {
      name: 'Sign Out Function',
      status: '✅',
      icon: <Check className="w-4 h-4 text-green-500" />,
      description: 'Sign out function available',
    },
  ];

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
        <User className="w-6 h-6" />
        Authentication Status
      </h3>

      <div className="space-y-3 mb-6">
        {checks.map((check, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-green-100">
            <div className="flex-shrink-0 mt-0.5">
              {check.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-700">{check.name}</span>
                <span className={`text-sm ${check.status.includes('✅') ? 'text-green-600' : check.status.includes('❌') ? 'text-red-600' : 'text-yellow-600'}`}>
                  {check.status}
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">{check.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        {user ? (
          <Button 
            onClick={() => signOut()}
            className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        ) : (
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
            disabled
          >
            <LogIn className="w-4 h-4" />
            Sign In (Use Nav)
          </Button>
        )}

        <Button 
          className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
          onClick={() => {
            if (user) {
              console.log('Current user:', {
                id: user.id,
                name: user.name,
                email: user.email,
                imageUrl: user.imageUrl,
              });
              alert('Check console for user data');
            } else {
              alert('No user authenticated');
            }
          }}
        >
          <User className="w-4 h-4" />
          {user ? 'Show Data' : 'Check Auth'}
        </Button>
      </div>

      {/* ENHANCEMENT FIRST: User data display */}
      {user && (
        <div className="mt-4 p-4 bg-white/50 rounded-lg border border-green-100">
          <h4 className="font-semibold text-green-800 mb-2">User Data</h4>
          <div className="text-sm space-y-1">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Name:</strong> {user.name}</div>
            {user.email && <div><strong>Email:</strong> {user.email}</div>}
            {user.imageUrl && (
              <div className="flex items-center gap-2">
                <strong>Avatar:</strong>
                <img src={user.imageUrl} alt="User avatar" className="w-6 h-6 rounded-full" />
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}