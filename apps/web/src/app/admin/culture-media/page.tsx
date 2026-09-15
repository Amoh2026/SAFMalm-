"use client";

import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase/client';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Trash2, Edit, Plus, Upload, Save, X, Image as ImageIcon } from 'lucide-react';

interface CultureMediaItem {
  id: string;
  src: string;
  name: string;
  date: string;
  description?: string;
  storagePath?: string;
}

export default function AdminCultureMediaPage() {
  const [media, setMedia] = useState<CultureMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', date: '', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'cultureMedia'));
      const items: CultureMediaItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          src: data.src,
          name: data.name,
          date: data.date,
          description: data.description || '',
          storagePath: data.storagePath || '',
        });
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMedia(items);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.name || !formData.date) {
      alert('Fyll i namn, datum och välj en bild.');
      return;
    }

    try {
      setUploading(true);

      const storagePath = `cultureMedia/${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'cultureMedia'), {
        src: downloadURL,
        name: formData.name,
        date: formData.date,
        description: formData.description,
        storagePath: storagePath,
        createdAt: new Date(),
      });

      setFormData({ name: '', date: '', description: '' });
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchMedia();
      alert('Bild uppladdad!');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Kunde inte ladda upp bilden.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: CultureMediaItem) => {
    if (!confirm(`Ta bort "${item.name}"?`)) return;

    try {
      await deleteDoc(doc(db, 'cultureMedia', item.id));

      if (item.storagePath) {
        try {
          await deleteObject(ref(storage, item.storagePath));
        } catch (e) {
          console.warn('Could not delete from storage:', e);
        }
      }

      await fetchMedia();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Kunde inte ta bort bilden.');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDoc(doc(db, 'cultureMedia', id), {
        name: formData.name,
        date: formData.date,
        description: formData.description,
      });
      setEditingId(null);
      setFormData({ name: '', date: '', description: '' });
      await fetchMedia();
    } catch (error) {
      console.error('Error updating:', error);
      alert('Kunde inte uppdatera.');
    }
  };

  const startEdit = (item: CultureMediaItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      date: item.date,
      description: item.description || '',
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Kulturmedia - Admin</h1>
      <p className="text-gray-600 mb-8">
        Hantera bilder som visas på Kultur-sidan. Endast bilder från aktuell månad visas för besökare.
      </p>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-400 p-6 mb-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Ladda upp ny bild
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Namn *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="t.ex. Kulturfestival 2026"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning (frivilligt)</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bild *</label>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Laddar upp...' : 'Ladda upp'}
        </button>
      </div>

      {/* Media List */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-400 p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" /> Alla bilder ({media.length})
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 py-8">Laddar...</p>
        ) : media.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Inga bilder uppladdade ännu.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <div key={item.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <img src={item.src} alt={item.name} className="w-full h-40 object-cover" />

                {editingId === item.id ? (
                  <div className="p-3 space-y-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Namn"
                    />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(item.id)}
                        className="flex-1 bg-green-600 text-white py-1 rounded text-sm flex items-center justify-center gap-1"
                      >
                        <Save className="h-3 w-3" /> Spara
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-gray-500 text-white py-1 rounded text-sm flex items-center justify-center gap-1"
                      >
                        <X className="h-3 w-3" /> Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    <p className="font-semibold text-blue-900">{item.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{item.date}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="flex-1 bg-blue-600 text-white py-1 rounded text-sm flex items-center justify-center gap-1"
                      >
                        <Edit className="h-3 w-3" /> Redigera
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex-1 bg-red-600 text-white py-1 rounded text-sm flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Ta bort
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}