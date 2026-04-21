export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}