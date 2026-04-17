import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Cloud, Shield, Zap, ArrowRight, FolderOpen, Search, Download } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col fade-in">
      {/* Navbar */}
      <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">Manus Storage</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/files">
                <Button variant="default" className="font-medium shadow-sm">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Button variant="default" className="font-medium shadow-sm">
                Get Started
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-24 pb-20 text-center">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-8 uppercase tracking-wider">
              <Zap className="h-3 w-3" />
              Next-Gen Cloud Storage
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Manage your files with <span className="text-primary italic">Manus Online</span>
            </h1>
            <p className="text-xl text-subtle mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the power of secure, cloud-based file management. Upload, organize, preview, and download your files from anywhere in the world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/files">
                <Button size="lg" className="h-14 px-8 text-lg font-semibold gap-2 shadow-lg shadow-primary/20">
                  Access Your Storage <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold bg-transparent">
                View Features
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border/60 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Secure Storage</h3>
                <p className="text-subtle leading-relaxed">
                  Your files are encrypted and stored securely using industry-standard protocols, ensuring only you have access.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border/60 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                  <FolderOpen className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Smart Organization</h3>
                <p className="text-subtle leading-relaxed">
                  Automatically categorize files by type. Effortlessly browse through your images, videos, and documents.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border/60 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">Instant Search</h3>
                <p className="text-subtle leading-relaxed">
                  Find any file in seconds with our high-speed search functionality. No more digging through folders.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center">
          <div className="container mx-auto px-6">
            <div className="bg-primary rounded-3xl p-12 md:p-20 text-white relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <Zap className="h-[200px] w-[200px] absolute -top-10 -right-10" />
                 <Cloud className="h-[150px] w-[150px] absolute -bottom-10 -left-10" />
               </div>
               <h2 className="text-4xl md:text-5xl font-extrabold mb-8 relative z-10">Ready to organize your life?</h2>
               <p className="text-primary-foreground/90 text-lg mb-10 max-w-xl mx-auto relative z-10 leading-relaxed font-medium">
                 Join thousands of users who trust Manus for their cloud storage needs. Simple, secure, and always online.
               </p>
               <Link href="/files">
                 <Button variant="secondary" size="lg" className="h-14 px-10 text-lg font-bold relative z-10 bg-white text-primary hover:bg-primary-foreground">
                   Start for Free <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
               </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">Manus Storage</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-subtle">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Manus Storage Online. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
