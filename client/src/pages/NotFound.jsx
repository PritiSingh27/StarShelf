import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-ink">404</h1>
          <h2 className="text-lg font-semibold text-ink">Page not found</h2>
          <p className="text-sm text-muted">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>
        <div>
          <Link to="/">
            <Button variant="brand" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Return to dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
