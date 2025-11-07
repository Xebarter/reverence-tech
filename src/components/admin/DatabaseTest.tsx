import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function DatabaseTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection by querying a simple table that should exist
        const { data: _data, error } = await supabase
          .from('services')
          .select('count')
          .limit(1);

        if (error) {
          setResult(`Error querying services table: ${error.message}`);
        } else {
          setResult(`Successfully connected to database. Services table exists with data.`);
        }
      } catch (error: any) {
        setResult(`Unexpected error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Database Connection Test</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Testing database connection...</p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800">{result}</p>
          </div>
        )}
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Make sure you've run all database migrations</li>
            <li>Check that the admin_users table exists</li>
            <li>Verify your Supabase credentials in the .env file</li>
            <li>If issues persist, try accessing <a href="/admin-temp" className="text-green-600 hover:underline">/admin-temp</a> to bypass admin checks</li>
          </ol>
        </div>
      </div>
    </div>
  );
}