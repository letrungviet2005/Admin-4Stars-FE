import React, { useEffect, useState } from 'react';
import config from '../../config/config';

interface Grammar {
  id: number;
  name: string;
  description?: string;
  order_index?: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

const Grammars: React.FC = () => {
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editInputs, setEditInputs] = useState({
    name: '',
    description: '',
    type: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGrammar, setNewGrammar] = useState({
    name: '',
    description: '',
    type: ''
  });

  const handleAddGrammar = async () => {
    try {
      const response = await fetch(`${config}admin/grammar-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGrammar)
      });

      if (!response.ok) throw new Error('Failed to add grammar');

      const created = await response.json();
      setGrammars(prev => [...prev, created]);
      setShowAddForm(false);
      setNewGrammar({ name: '', description: '', type: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (item: Grammar) => {
    setEditingId(item.id);
    setEditInputs({
      name: item.name,
      description: item.description || '',
      type: item.type || ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id: number) => {
    try {
      const response = await fetch(`${config}admin/grammar-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editInputs)
      });

      if (!response.ok) throw new Error(`Failed to edit grammar with ID: ${id}`);

      const updated = await response.json();
      setGrammars(prev => prev.map(item => item.id === id ? updated : item));
      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${config}admin/grammar-categories/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`Failed to delete grammar with ID: ${id}`);

      setGrammars(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch(config + 'admin/grammar-categories')
      .then(res => res.json())
      .then(data => setGrammars(data))
      .catch(err => console.error('Error loading grammar categories:', err));
  }, []);

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📚 Grammar Categories
          </h2>
          <button
            onClick={() => setShowAddForm(prev => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
          >
            ➕ Thêm chủ đề ngữ pháp
          </button>
        </div>

        {showAddForm && (
          <div className="mt-6 bg-blue-50 border border-blue-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">➕ Thêm Chủ Đề Ngữ Pháp Mới</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tên chủ đề</label>
                <input
                  name="name"
                  value={newGrammar.name}
                  onChange={(e) => setNewGrammar(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  placeholder="Nhập tên chủ đề"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Loại</label>
                <input
                  name="type"
                  value={newGrammar.type}
                  onChange={(e) => setNewGrammar(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                  placeholder="Ví dụ: ngữ pháp cơ bản, nâng cao..."
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Mô tả</label>
              <textarea
                name="description"
                value={newGrammar.description}
                onChange={(e) => setNewGrammar(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 min-h-[80px]"
                placeholder="Mô tả ngắn gọn về chủ đề ngữ pháp"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleAddGrammar}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-md"
              >
                ✅ Lưu
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-md"
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grammars.map(item => (
          <div
            key={item.id}
            className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition relative"
          >
            <div className="absolute top-2 right-2 flex gap-2">
              {editingId === item.id ? (
                <>
                  <button className="text-green-500" onClick={() => handleSave(item.id)}>✅</button>
                  <button className="text-gray-500" onClick={() => setEditingId(null)}>❌</button>
                </>
              ) : (
                <>
                  <button className="text-blue-500" onClick={() => handleEditClick(item)}>✏️</button>
                  <button className="text-red-500" onClick={() => handleDelete(item.id)}>🗑️</button>
                </>
              )}
            </div>

            {editingId === item.id ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={editInputs.name}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full mb-2 mt-5"
                />
                <textarea
                  name="description"
                  value={editInputs.description}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full mb-2"
                />
                <input
                  type="text"
                  name="type"
                  value={editInputs.type}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 w-full"
                />
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-blue-600 mb-2 mt-5">{item.name}</h3>
                {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                <p className="text-xs text-gray-500 mt-3">Type: {item.type}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Grammars;
