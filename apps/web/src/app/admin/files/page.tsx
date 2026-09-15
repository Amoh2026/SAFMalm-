'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  File,
  Upload,
  FolderOpen,
  FileText,
  Image,
  FileArchive,
  Download,
  Trash2,
  Search,
  X,
  Check,
  FileIcon,
  Folder,
  Eye,
  ChevronRight,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: string;
  size?: string;
  uploadedBy: string;
  uploadedAt: string;
  visibility: 'ADMIN' | 'MEMBER' | 'PUBLIC';
  url?: string;
  parentId?: string | null;
}

type FilterType = 'all' | 'files' | 'folders' | 'public';

const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
const VIDEO_TYPES = ['mp4', 'webm', 'ogg', 'mov'];
const AUDIO_TYPES = ['mp3', 'wav', 'ogg', 'm4a'];
const TEXT_TYPES = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'];
const PDF_TYPES = ['pdf'];

export default function AdminFilesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'MEMBER' | 'ADMIN'>('PUBLIC');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // File viewer state
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/list-files');
        const data = await response.json();

        const demoFolders: FileItem[] = [
          { id: 'folder-1', name: 'Dokument', type: 'folder', uploadedBy: 'Admin', uploadedAt: '2026-01-15', visibility: 'PUBLIC', parentId: null },
          { id: 'folder-2', name: 'Bilder', type: 'folder', uploadedBy: 'Admin', uploadedAt: '2026-01-14', visibility: 'MEMBER', parentId: null },
          { id: 'folder-1-1', name: 'Protokoll', type: 'folder', uploadedBy: 'Admin', uploadedAt: '2026-01-10', visibility: 'ADMIN', parentId: 'folder-1' },
        ];

        if (data.success && data.files) {
          const realFiles: FileItem[] = data.files.map((f: any) => ({
            ...f,
            type: 'file' as const,
            uploadedBy: 'Admin',
            parentId: null,
          }));
          setFiles([...demoFolders, ...realFiles]);
        } else {
          setFiles([...demoFolders]);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        setFiles([
          { id: 'folder-1', name: 'Dokument', type: 'folder', uploadedBy: 'Admin', uploadedAt: '2026-01-15', visibility: 'PUBLIC', parentId: null },
          { id: 'folder-2', name: 'Bilder', type: 'folder', uploadedBy: 'Admin', uploadedAt: '2026-01-14', visibility: 'MEMBER', parentId: null },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder className="h-12 w-12 text-yellow-500" />;
    if (file.fileType === 'pdf') return <FileText className="h-12 w-12 text-red-500" />;
    if (file.fileType === 'xlsx' || file.fileType === 'xls') return <FileText className="h-12 w-12 text-green-500" />;
    if (IMAGE_TYPES.includes(file.fileType || '')) return <Image className="h-12 w-12 text-purple-500" />;
    if (file.fileType === 'zip') return <FileArchive className="h-12 w-12 text-orange-500" />;
    return <FileIcon className="h-12 w-12 text-gray-500" />;
  };

  const getVisibilityBadge = (visibility: 'ADMIN' | 'MEMBER' | 'PUBLIC') => {
    switch (visibility) {
      case 'PUBLIC': return <span className="text-xs bg-green-100 text-green-700 border-2 border-green-400 px-2 py-1 rounded-full">Allmän</span>;
      case 'MEMBER': return <span className="text-xs bg-blue-100 text-blue-700 border-2 border-blue-400 px-2 py-1 rounded-full">Medlemmar</span>;
      case 'ADMIN': return <span className="text-xs bg-red-100 text-red-700 border-2 border-red-400 px-2 py-1 rounded-full">Admin</span>;
    }
  };

  const filesInCurrentFolder = files.filter((f) => (f.parentId ?? null) === currentFolderId);

  const filteredFiles = filesInCurrentFolder.filter((file) => {
    if (searchTerm && !file.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filter === 'files') return file.type === 'file';
    if (filter === 'folders') return file.type === 'folder';
    if (filter === 'public') return file.type === 'file' && file.visibility === 'PUBLIC';
    return true;
  });

  const folders = filteredFiles.filter((f) => f.type === 'folder');
  const fileItems = filteredFiles.filter((f) => f.type === 'file');

  const getBreadcrumb = () => {
    const path: { id: string | null; name: string }[] = [{ id: null, name: 'Filer' }];
    if (currentFolderId) {
      const folder = files.find((f) => f.id === currentFolderId);
      if (folder) path.push({ id: folder.id, name: folder.name });
    }
    return path;
  };

  const openFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSearchTerm('');
    setFilter('all');
  };

  const goToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSearchTerm('');
    setFilter('all');
  };

  /** Open file in in-page preview */
  const handleView = async (fileId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const file = files.find((f) => f.id === fileId);
    if (!file?.url || file.url === '#') {
      alert('Ingen fil att visa (demo-data)');
      return;
    }

    setPreviewFile(file);
    setPreviewText(null);

    // For text files, fetch and display inline
    if (TEXT_TYPES.includes((file.fileType || '').toLowerCase())) {
      setPreviewLoading(true);
      try {
        const res = await fetch(file.url);
        const text = await res.text();
        setPreviewText(text);
      } catch (err) {
        setPreviewText('Kunde inte ladda filen.');
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewText(null);
  };

  const handleDownload = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const file = files.find((f) => f.id === fileId);
    if (!file?.url || file.url === '#') {
      alert('Laddar ner: ' + (file?.name || 'fil'));
      return;
    }

    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const file = files.find((f) => f.id === fileId);
    if (file?.url && file.url !== '#') {
      if (confirm('Är du säker på att du vill ta bort "' + file.name + '"?')) {
        try {
          await fetch('/api/delete-file', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: file.url }),
          });
          setFiles((prev) => prev.filter((f) => f.id !== fileId));
          alert('Filen har tagits bort!');
        } catch (error) {
          alert('Kunde inte ta bort filen');
        }
      }
    } else {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      alert('Filen har tagits bort!');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Välj en fil först!');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('visibility', visibility);
      if (currentFolderId) formData.append('parentId', currentFolderId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const fileType = selectedFile.name.split('.').pop() || 'file';
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
      const sizeKB = (selectedFile.size / 1024).toFixed(0);
      const sizeStr = selectedFile.size > 1024 * 1024 ? sizeMB + ' MB' : sizeKB + ' KB';

      setFiles((prev) => [
        ...prev,
        {
          id: 'new-' + Date.now(),
          name: selectedFile.name,
          type: 'file',
          fileType: fileType,
          size: sizeStr,
          uploadedBy: 'Admin',
          uploadedAt: new Date().toISOString().split('T')[0],
          visibility: visibility,
          url: data.url,
          parentId: currentFolderId,
        },
      ]);

      setSelectedFile(null);
      setShowUploadModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('Filen har laddats upp!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload misslyckades: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  /** Render the preview content based on file type */
  const renderPreviewContent = () => {
    if (!previewFile?.url) return null;

    const ext = (previewFile.fileType || '').toLowerCase();

    if (PDF_TYPES.includes(ext)) {
      return (
        <iframe
          src={previewFile.url}
          className="w-full h-[70vh] rounded border border-gray-200"
          title={previewFile.name}
        />
      );
    }

    if (IMAGE_TYPES.includes(ext)) {
      return (
        <img
          src={previewFile.url}
          alt={previewFile.name}
          className="max-w-full max-h-[70vh] mx-auto rounded border border-gray-200"
        />
      );
    }

    if (VIDEO_TYPES.includes(ext)) {
      return (
        <video
          src={previewFile.url}
          controls
          className="max-w-full max-h-[70vh] mx-auto rounded border border-gray-200"
        >
          Din webbläsare stödjer inte video.
        </video>
      );
    }

    if (AUDIO_TYPES.includes(ext)) {
      return (
        <audio src={previewFile.url} controls className="w-full">
          Din webbläsare stödjer inte ljud.
        </audio>
      );
    }

    if (TEXT_TYPES.includes(ext)) {
      if (previewLoading) {
        return <p className="text-gray-500">Laddar text...</p>;
      }
      return (
        <pre className="text-sm bg-gray-50 p-4 rounded border border-gray-200 max-h-[70vh] overflow-auto whitespace-pre-wrap">
          {previewText ?? '(tom fil)'}
        </pre>
      );
    }

    // Fallback — can't preview
    return (
      <div className="text-center py-12">
        <FileIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-700 font-medium mb-2">
          Denna filtyp kan inte förhandsgranskas
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Filen "{previewFile.name}" kan laddas ner för att öppnas lokalt.
        </p>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Laddar filer...</div>;
  }

  const breadcrumb = getBreadcrumb();
  const ext = (previewFile?.fileType || '').toLowerCase();
  const isViewable =
    PDF_TYPES.includes(ext) ||
    IMAGE_TYPES.includes(ext) ||
    VIDEO_TYPES.includes(ext) ||
    AUDIO_TYPES.includes(ext) ||
    TEXT_TYPES.includes(ext);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Filhantering</h1>
          <p className="text-gray-500 mt-1">Hantera filer och dokument</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-400"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload className="h-4 w-4 mr-2" /> Ladda upp fil
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg flex-wrap">
        {breadcrumb.map((crumb, i) => (
          <div key={crumb.id ?? 'root'} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            <button
              onClick={() => goToFolder(crumb.id)}
              className={`flex items-center gap-2 rounded-lg font-semibold transition ${
                i === 0 ? 'px-6 py-3 text-lg' : 'px-3 py-1.5 text-sm'
              } ${
                i === breadcrumb.length - 1
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'bg-white text-blue-900 border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-500 shadow-sm'
              }`}
            >
              {i === 0 ? (
                <>
                  <Home className="h-5 w-5" /> {crumb.name}
                </>
              ) : (
                <>
                  <Folder className="h-3.5 w-3.5" /> {crumb.name}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card
          onClick={() => setFilter(filter === 'files' ? 'all' : 'files')}
          className={`cursor-pointer transition border-2 ${
            filter === 'files'
              ? 'bg-blue-100 border-blue-600 ring-2 ring-blue-300'
              : 'bg-blue-50 border-blue-400 hover:bg-blue-100'
          } shadow-md`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Totalt filer</p>
              <p className="text-2xl font-bold text-blue-900">
                {filesInCurrentFolder.filter((f) => f.type === 'file').length}
              </p>
            </div>
            <File className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>

        <Card
          onClick={() => setFilter(filter === 'folders' ? 'all' : 'folders')}
          className={`cursor-pointer transition border-2 ${
            filter === 'folders'
              ? 'bg-green-100 border-green-600 ring-2 ring-green-300'
              : 'bg-green-50 border-green-400 hover:bg-green-100'
          } shadow-md`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Mappar</p>
              <p className="text-2xl font-bold text-green-900">
                {filesInCurrentFolder.filter((f) => f.type === 'folder').length}
              </p>
            </div>
            <Folder className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>

        <Card
          onClick={() => setFilter(filter === 'public' ? 'all' : 'public')}
          className={`cursor-pointer transition border-2 ${
            filter === 'public'
              ? 'bg-purple-100 border-purple-600 ring-2 ring-purple-300'
              : 'bg-purple-50 border-purple-400 hover:bg-purple-100'
          } shadow-md`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Offentliga filer</p>
              <p className="text-2xl font-bold text-purple-900">
                {filesInCurrentFolder.filter((f) => f.type === 'file' && f.visibility === 'PUBLIC').length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      {filter !== 'all' && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-400 rounded-lg">
          <span className="text-sm text-gray-600">Aktivt filter:</span>
          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 border border-blue-400 font-medium">
            {filter === 'files' && 'Endast filer'}
            {filter === 'folders' && 'Endast mappar'}
            {filter === 'public' && 'Endast offentliga filer'}
          </span>
          <button
            onClick={() => setFilter('all')}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Rensa filter
          </button>
        </div>
      )}

      {/* Search + view */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Sök filer och mappar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400' : 'border-2 border-blue-400 hover:bg-blue-50'}
          >
            <File className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400' : 'border-2 border-blue-400 hover:bg-blue-50'}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid / list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="bg-white rounded-xl p-4 border-2 border-blue-400 hover:shadow-xl transition cursor-pointer"
              onClick={() => openFolder(folder.id)}
            >
              <div className="flex items-center justify-center mb-3">
                <Folder className="h-16 w-16 text-yellow-500" />
              </div>
              <p className="font-medium text-gray-800 text-center truncate">{folder.name}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
                <span>{folder.uploadedBy}</span><span>•</span><span>{folder.uploadedAt}</span>
              </div>
              <div className="flex justify-center mt-2">{getVisibilityBadge(folder.visibility)}</div>
            </div>
          ))}

          {fileItems.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-xl p-4 border-2 border-blue-400 hover:shadow-xl transition cursor-pointer group relative"
              onClick={() => handleView(file.id)}
            >
              <div className="flex items-center justify-center mb-3">{getFileIcon(file)}</div>
              <p className="font-medium text-gray-800 text-center truncate">{file.name}</p>
              <div className="flex items-center justify-center gap-2 mt-1 text-xs text-gray-500">
                <span>{file.size}</span><span>•</span><span>{file.uploadedBy}</span>
              </div>
              <div className="flex justify-center mt-2">{getVisibilityBadge(file.visibility)}</div>

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-2 border-green-400 bg-white"
                  onClick={(e) => handleView(file.id, e)}
                  title="Visa"
                >
                  <Eye className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 border-2 border-blue-400 bg-white"
                  onClick={(e) => handleDownload(file.id, e)}
                  title="Ladda ner"
                >
                  <Download className="h-3 w-3 text-blue-600" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 w-7 p-0 border-2 border-red-400"
                  onClick={(e) => handleDelete(file.id, e)}
                  title="Ta bort"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-blue-400 shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-50 border-b-2 border-blue-400">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Namn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Typ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Storlek</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Synlighet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Uppladdad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200">
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-blue-50/50 transition cursor-pointer"
                  onClick={() => {
                    if (file.type === 'folder') openFolder(file.id);
                    else handleView(file.id);
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {file.type === 'folder' ? (
                        <Folder className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <FileIcon className="h-5 w-5 text-gray-500" />
                      )}
                      <span className="font-medium text-gray-800">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                    {file.type === 'folder' ? 'Mapp' : file.fileType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {file.type === 'folder' ? '-' : file.size}
                  </td>
                  <td className="px-6 py-4">{getVisibilityBadge(file.visibility)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{file.uploadedBy}</div>
                    <div className="text-xs">{file.uploadedAt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {file.type !== 'folder' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-green-400"
                            onClick={(e) => handleView(file.id, e)}
                            title="Visa"
                          >
                            <Eye className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-blue-400"
                            onClick={(e) => handleDownload(file.id, e)}
                            title="Ladda ner"
                          >
                            <Download className="h-4 w-4 text-blue-600" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="border-2 border-red-400"
                        onClick={(e) => handleDelete(file.id, e)}
                        title="Ta bort"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-blue-400 rounded-xl bg-blue-50/30">
          <FolderOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {currentFolderId ? 'Denna mapp är tom' : 'Inga filer eller mappar hittades'}
          </p>
          <Button
            className="mt-4 bg-blue-600 hover:bg-blue-700 border-2 border-blue-400"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" /> Ladda upp fil
          </Button>
        </div>
      )}

      {/* ============================ */}
      {/* FILE PREVIEW MODAL */}
      {/* ============================ */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border-2 border-blue-400 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b-2 border-blue-400 flex items-center justify-between gap-4 flex-wrap bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon className="h-6 w-6 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-blue-900 truncate">{previewFile.name}</h3>
                  <p className="text-xs text-gray-500">
                    {previewFile.size} • {previewFile.visibility}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => handleDownload(previewFile.id, e)}
                >
                  <Download className="h-4 w-4 mr-1" /> Ladda ner
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={closePreview}
                  className="border-2 border-gray-300"
                >
                  <X className="h-4 w-4 mr-1" /> Stäng
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-100">
              {isViewable ? (
                renderPreviewContent()
              ) : (
                renderPreviewContent()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-blue-400 shadow-xl">
            <div className="p-6 border-b-2 border-blue-400">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-blue-900">Ladda upp fil</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
              {currentFolderId && (
                <p className="text-sm text-gray-500 mt-2">
                  Laddas upp till: <strong>{files.find((f) => f.id === currentFolderId)?.name}</strong>
                </p>
              )}
            </div>
            <div className="p-6">
              <div
                className="border-2 border-dashed border-blue-400 rounded-lg p-12 text-center hover:border-blue-600 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files.length > 0) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <Upload className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                <p className="text-gray-600 font-medium">Dra och släpp filer här</p>
                <p className="text-sm text-gray-400 mt-1">eller klicka för att välja filer</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="mt-4 border-2 border-blue-400 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Välj fil
                </Button>
              </div>

              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-400 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Vald fil:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </p>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Synlighet</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'PUBLIC' | 'MEMBER' | 'ADMIN')}
                  className="w-full p-2 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PUBLIC">Allmänheten</option>
                  <option value="MEMBER">Medlemmar</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-400 hover:border-blue-500 disabled:opacity-50"
                  disabled={!selectedFile || uploading}
                  onClick={handleUpload}
                >
                  {uploading ? (
                    'Laddar upp...'
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" /> Ladda upp
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-red-400 text-gray-700 hover:bg-red-50"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                >
                  Avbryt
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}