// AI assisted development
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Newspaper, Clock, Landmark, Briefcase, GraduationCap, Timer, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { fetchNewsById } from '../api/news';

interface NewsDetailPageProps {
  onNavigate: (page: string) => void;
}

const typeLabels: Record<string, string> = {
  GOVT: 'Government',
  PRIVATE: 'Private',
  EXAM: 'Exam',
  DEADLINE: 'Deadline',
  UPDATE: 'Update',
};

const typeIcons: Record<string, JSX.Element> = {
  GOVT: <Landmark className="w-5 h-5" />,
  PRIVATE: <Briefcase className="w-5 h-5" />,
  EXAM: <GraduationCap className="w-5 h-5" />,
  DEADLINE: <Timer className="w-5 h-5" />,
  UPDATE: <Sparkles className="w-5 h-5" />,
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  GOVT: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  PRIVATE: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  EXAM: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  DEADLINE: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  UPDATE: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
}

export function NewsDetailPage({ onNavigate }: NewsDetailPageProps) {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!newsId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchNewsById(newsId);
        if (data) {
          setNews(data);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  if (notFound || !news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">News Not Found</h1>
          <p className="text-gray-600 mb-4">The news article you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/news')}>Back to News</Button>
        </div>
      </div>
    );
  }

  const type = news.type?.toUpperCase() || 'UPDATE';
  const typeColor = typeColors[type] || typeColors.UPDATE;
  const typeLabel = typeLabels[type] || 'Update';
  const typeIcon = typeIcons[type] || <Sparkles className="w-5 h-5" />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/news')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to News
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Featured Image - Responsive */}
        {news.imageUrl && (
          <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
            <img
              src={news.imageUrl}
              alt={news.title}
              className="w-full object-cover h-48 sm:h-64 md:h-80 lg:h-96 transition-all duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* News Header */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={`${typeColor.bg} ${typeColor.text} ${typeColor.border} border flex items-center gap-2 px-3 py-1`}>
              {typeIcon}
              {typeLabel}
            </Badge>
            {news.breaking && (
              <Badge className="bg-red-100 text-red-700 border-red-200 border px-3 py-1">
                Breaking
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {news.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(news.date)}</span>
            </div>
            {news.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Published {new Date(news.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Full Story Content */}
        {news.fullStory ? (
          <Card className="p-6 md:p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: news.fullStory }}
            />
          </Card>
        ) : (
          <Card className="p-6 md:p-8">
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Full story content is not available for this news article.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

