'use client';

import Link from 'next/link';

export default function ConfirmRegistration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check your email
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent you a confirmation email. Please click the link in the email to verify your account.
          </p>
          <p className="text-gray-600 mb-6">
            After confirming your email, you'll be able to complete your profile and add your pets.
          </p>
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 