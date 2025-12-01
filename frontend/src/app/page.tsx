export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-6xl font-bold text-center mb-4">
          Welcome to Martnex
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Next-Generation Multi-Vendor Marketplace Platform
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">For Buyers</h2>
            <p className="text-gray-600">
              Browse products from multiple sellers, secure checkout, and track your orders.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">For Sellers</h2>
            <p className="text-gray-600">
              Register as a seller, manage products, track earnings, and grow your business.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">For Admins</h2>
            <p className="text-gray-600">
              Manage platform, users, commissions, and resolve disputes efficiently.
            </p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Powered by Medusa.js v2 • Built with Next.js 16 • Open Source (MIT License)
          </p>
        </div>
      </div>
    </main>
  );
}
