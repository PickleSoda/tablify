import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Database } from 'lucide-react';
import { Terminal } from './terminal';

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Organize Your Data
                <span className="block text-purple-700">The Smarter Way</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Meet <strong>Tablify</strong>—your powerful, user-friendly platform for creating and sharing relational databases. Whether you're managing inventory, tracking projects, or building workflows, Tablify simplifies data management without the need for coding or complex queries.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <a
                  href="/signup"
                  target="_blank"
                >
                  <Button className="bg-purple-700 hover:bg-purple-800 text-white rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <Terminal />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-700 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Relational Database Simplified
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Organize and link your data effortlessly. Manage relationships between records with an intuitive interface that's as easy as a spreadsheet.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-700 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Automate Your Workflows
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Save time and reduce errors with built-in automations. From notifications to data updates, Tablify helps you streamline your processes.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-700 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  User-Friendly Collaboration
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Collaborate with your team in real-time. Share databases, assign roles, and work together seamlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Tablify: More Than Just a Spreadsheet
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Go beyond traditional spreadsheets. Tablify combines the simplicity of tools like Excel with the power of relational databases. Manage, automate, and scale—all in one platform.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <a
                href="/features"
                target="_blank"
              >
                <Button className="bg-purple-500 hover:bg-purple-800 text-white rounded-full text-xl px-12 py-6 inline-flex items-center justify-center">
                  Explore Features
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
