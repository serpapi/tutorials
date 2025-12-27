import './globals.css';
import Image from 'next/image';

export const metadata = {
  title: 'AI Product Recommendations - Powered by SerpApi',
  description: 'Find the best products across Google Shopping and Amazon with intelligent AI analysis',
  keywords: ['AI', 'product search', 'recommendations', 'shopping', 'SerpApi', 'Google Shopping', 'Amazon'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Image
                  src="/logos/serpapi-logo.webp"
                  alt="SerpApi"
                  width={100}
                  height={50}
                  className="inline-block"
                  priority
                />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                AI Product Recommendations
              </h1>
              <p className="text-sm text-purple-200">
                Search across Google Shopping and Amazon with intelligent AI analysis
              </p>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-12">
          {children}
        </main>

        <footer className="bg-gray-800 text-white py-8 mt-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <i className="fas fa-code"></i>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}


