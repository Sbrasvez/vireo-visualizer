import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HomeSections from "@/components/HomeSections";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HomeSections />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
