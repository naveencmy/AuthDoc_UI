import { CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isUploadPage = location.pathname === '/upload';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <CheckCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">AuthDoc</span>
        </Link>

        <nav className="flex items-center gap-6">
          {!isUploadPage && (
            <Link 
              to="/upload" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Batch Upload
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
