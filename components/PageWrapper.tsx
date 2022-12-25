import Head from "next/head";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-gray-700 min-h-screen flex flex-col">
        <Head>
          <title>Training Plan</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 md:px-8 text-gray-300">
          {children}
        </main>
      </div>      
    );
}