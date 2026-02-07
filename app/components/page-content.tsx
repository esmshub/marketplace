export default function PageContent({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full gap-4">
      {title && (
        <h1 className="scroll-m-20 text-xl font-semibold tracking-tight">
          {title}
        </h1>
      )}
      {children}
    </div>
  );
}
