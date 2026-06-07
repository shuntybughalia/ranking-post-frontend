import Header from "./components/Header";
import Hero from "./components/Hero";
import BlogSection from "./components/BlogSection";
import NewsletterCTA from "./components/NewsletterCTA";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <BlogSection />
      <div className="mx-auto w-full max-w-6xl px-6 pb-10">
        <NewsletterCTA />
      </div>
    </>
  );
}
