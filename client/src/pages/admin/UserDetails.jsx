import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, MapPin, Calendar, Store, Star, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api/axios.js';
import { formatDate, formatRating } from '../../lib/format.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';

export default function UserDetails() {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/admin/users/${id}`);
        setUserDetails(res.data);
      } catch {
        // Handled by interceptor
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 text-center py-12">
        <h2 className="text-lg font-bold text-ink">User not found</h2>
        <Link to="/admin/users" className="text-xs font-semibold text-brand-text hover:underline">
          Return to user list
        </Link>
      </div>
    );
  }

  const roleVar = userDetails.role === 'ADMIN' ? 'admin' : userDetails.role === 'OWNER' ? 'owner' : 'user';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to users list</span>
      </Link>

      <Card className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand-text font-bold text-base flex items-center justify-center border border-brand/20">
              {userDetails.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-ink">{userDetails.name}</h1>
              <p className="text-xs text-muted">User ID: #{userDetails.id}</p>
            </div>
          </div>
          <Badge variant={roleVar}>{userDetails.role}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted">Email Address</p>
                <p className="text-sm font-medium text-ink mt-0.5">{userDetails.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted">Address</p>
                <p className="text-sm font-medium text-ink mt-0.5">{userDetails.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted">Member Since</p>
                <p className="text-sm font-medium text-ink mt-0.5">{formatDate(userDetails.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-muted">Verification Status</p>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold mt-1">
                  {userDetails.emailVerified ? (
                    <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Email Verified
                    </span>
                  ) : (
                    <span className="text-muted inline-flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {userDetails.role === 'OWNER' && (
              <div className="p-4 rounded-xl bg-brand-soft/40 border border-brand/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-text">
                  <Store className="w-4 h-4" />
                  <span>Assigned Store Details</span>
                </div>
                {userDetails.storeName ? (
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-ink">{userDetails.storeName}</p>
                    <div className="flex items-center gap-1 text-xs font-semibold text-star">
                      <Star className="w-4 h-4 fill-star text-star" />
                      <span>{formatRating(userDetails.storeRating)} Average Rating</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted">No store assigned to this owner yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
