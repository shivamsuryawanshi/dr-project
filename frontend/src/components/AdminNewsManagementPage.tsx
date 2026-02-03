// AI assisted development
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowLeft, Loader2, X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { fetchAllNews, createNews, updateNews, deleteNews, uploadNewsImage, PulseUpdate, NewsPayload, PulseType } from '../api/news';
import { useAuth } from '../contexts/AuthContext';

interface AdminNewsManagementPageProps {
  onNavigate: (page: string) => void;
}

export function AdminNewsManagementPage({ onNavigate }: AdminNewsManagementPageProps) {
  const { token } = useAuth();
  const [news, setNews] = useState<PulseUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<PulseUpdate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<NewsPayload>({
    title: '',
    type: 'UPDATE',
    date: new Date().toISOString().split('T')[0],
    breaking: false,
    fullStory: '',
    showOnHomepage: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllNews();
      setNews(data);
    } catch (e: any) {
      setError(`Failed to fetch news: ${e.message}`);
      console.error('Error fetching news:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleCreateNew = () => {
    setFormData({
      title: '',
      type: 'UPDATE',
      date: new Date().toISOString().split('T')[0],
      breaking: false,
      fullStory: '',
      showOnHomepage: false,
    });
    setEditingNews(null);
    setSelectedImage(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const handleEdit = (newsItem: PulseUpdate) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      type: newsItem.type,
      date: newsItem.date,
      breaking: newsItem.breaking || false,
      fullStory: newsItem.fullStory || '',
      showOnHomepage: newsItem.showOnHomepage || false,
    });
    setSelectedImage(null);
    setImagePreview(newsItem.imageUrl || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;
    try {
      await deleteNews(id);
      alert('News deleted successfully!');
      loadNews();
    } catch (e: any) {
      alert(`Error deleting news: ${e.message}`);
      console.error('Error deleting news:', e);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      let savedNews: PulseUpdate;
      
      if (editingNews) {
        savedNews = await updateNews(editingNews.id, formData);
      } else {
        savedNews = await createNews(formData);
      }

      // Upload image if selected
      if (selectedImage && savedNews.id) {
        setUploadingImage(true);
        try {
          await uploadNewsImage(savedNews.id, selectedImage);
        } catch (imgError: any) {
          console.error('Image upload failed:', imgError);
          alert('News saved but image upload failed. You can try uploading the image again by editing the news.');
        } finally {
          setUploadingImage(false);
        }
      }

      alert(editingNews ? 'News updated successfully!' : 'News created successfully!');
      setShowForm(false);
      setEditingNews(null);
      setSelectedImage(null);
      setImagePreview(null);
      loadNews();
    } catch (e: any) {
      let errorMessage = 'Failed to save news. Please try again.';
      if (e.response?.data) {
        if (e.response.data.error) {
          errorMessage = e.response.data.error;
        } else if (e.response.data.message) {
          errorMessage = e.response.data.message;
        } else if (e.response.data.errors) {
          const errors = e.response.data.errors;
          errorMessage = typeof errors === 'object' ? Object.values(errors)[0] as string : String(errors);
        }
      } else if (e.message) {
        errorMessage = e.message;
      }
      alert(`Error saving news: ${errorMessage}`);
      console.error('Error saving news:', e);
      console.error('Error response:', e.response?.data);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNews(null);
    setSelectedImage(null);
    setImagePreview(null);
    setFormData({
      title: '',
      type: 'UPDATE',
      date: new Date().toISOString().split('T')[0],
      breaking: false,
      fullStory: '',
      showOnHomepage: false,
    });
  };

  const getTypeBadge = (type: PulseType) => {
    const colors: Record<PulseType, string> = {
      GOVT: 'bg-blue-100 text-blue-700 border-blue-200',
      PRIVATE: 'bg-purple-100 text-purple-700 border-purple-200',
      EXAM: 'bg-orange-100 text-orange-700 border-orange-200',
      DEADLINE: 'bg-red-100 text-red-700 border-red-200',
      UPDATE: 'bg-green-100 text-green-700 border-green-200',
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard/admin')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl text-gray-900 mb-2">Manage News</h1>
            <p className="text-gray-600">Create, edit, and delete news updates</p>
          </div>
          {!showForm && (
            <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New News
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingNews ? 'Edit News' : 'Create New News'}
              </h2>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter news title"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as PulseType })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GOVT">Government</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="DEADLINE">Deadline</SelectItem>
                      <SelectItem value="UPDATE">Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div>
                <Label>News Image (Featured Image)</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 sm:h-64 object-cover rounded-lg border border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> news image
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This image will be displayed at the top of the full news story page. Recommended size: 1200x600px
                </p>
              </div>

              <div>
                <Label htmlFor="fullStory">Full Story Content</Label>
                <Textarea
                  id="fullStory"
                  value={formData.fullStory || ''}
                  onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                  placeholder="Enter the full story content (HTML supported)"
                  className="mt-1 min-h-[200px]"
                  rows={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting. This content will be displayed on the full story page.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="breaking"
                    checked={formData.breaking}
                    onChange={(e) => setFormData({ ...formData, breaking: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <Label htmlFor="breaking" className="cursor-pointer">
                    Mark as Breaking News
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showOnHomepage"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <Label htmlFor="showOnHomepage" className="cursor-pointer">
                    Show on Homepage
                  </Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSubmit} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading Image...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingNews ? 'Update News' : 'Create News'}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={uploadingImage}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* News List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : news.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No news items found. Create your first news item!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  {/* Thumbnail if image exists */}
                  {item.imageUrl && (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 mr-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      {item.imageUrl && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Image
                        </Badge>
                      )}
                      {item.breaking && (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          Breaking
                        </Badge>
                      )}
                      {getTypeBadge(item.type)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Date: {formatDate(item.date)}
                      {item.createdAt && ` • Created: ${formatDate(item.createdAt)}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="w-full justify-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 w-full justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

