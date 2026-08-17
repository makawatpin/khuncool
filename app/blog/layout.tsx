import BlogViewTracker from "./_components/BlogViewTracker";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BlogViewTracker />
      {children}
    </>
  );
}
