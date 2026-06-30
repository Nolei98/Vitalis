/**
 * Wrapper padrão de página — garante que o conteúdo caiba no viewport no desktop/tablet
 * sem scroll de browser. No mobile o layout flui normalmente.
 */
export default function PageFrame({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`h-full flex flex-col gap-3 page-enter ${className}`}>
      {children}
    </div>
  );
}
