import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import config from "../../config/config";

interface Vocabulary {
  id: number;
  word: string;
  definitionEn: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  partOfSpeech?: string;
  pronunciation?: string;
  image?: string;
  audio?: string;
  category: {
    id: number;
    name: string;
  };
}

const Vocabulary: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vocabulary>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    loadVocabularies();
  }, [category]);

  const loadVocabularies = async () => {
    try {
      const page = 1;
      const size = 100;
      const sort = "id,asc";
      const accessToken = localStorage.getItem("accessToken");
  
      const queryParams = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort: sort,
      });
  
      if (category) {
        queryParams.append("categoryId", category);
      }
  
      const endpoint = `${config}admin/vocabularies?${queryParams.toString()}`;
      console.log("Fetching vocabularies from:", endpoint);
  
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Vocabularies data received:", data);
  
      if (data && Array.isArray(data.content)) {
        setVocabularies(data.content);
      } else {
        console.warn("Unexpected vocabulary data format:", data);
        setVocabularies([]);
      }
    } catch (err) {
      console.error("Error loading vocabularies:", err);
      setVocabularies([]); // fallback để không bị lỗi render
    }
  };
  
  

  const startEdit = (vocab: Vocabulary) => {
    setEditingId(vocab.id);
    setEditForm({
      word: vocab.word,
      definitionEn: vocab.definitionEn,
      meaningVi: vocab.meaningVi,
      exampleEn: vocab.exampleEn,
      exampleVi: vocab.exampleVi,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (id: number) => {
    try {
      const response = await fetch(config + `admin/vocabularies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Failed to update vocabulary");

      setEditingId(null);
      setEditForm({});
      loadVocabularies();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi cập nhật từ vựng!");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa từ này không?")) return;

    try {
      const response = await fetch(config + `admin/vocabularies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete vocabulary");

      loadVocabularies();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi xóa từ vựng!");
    }
  };

  const filteredVocabularies = vocabularies.filter((vocab) =>
    vocab.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-semibold flex items-center gap-2">
          <span>📚</span> Vocabulary List
        </h2>
        <button
          onClick={() => {}}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition"
        >
          + Thêm từ vựng
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Tìm từ vựng..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-6 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filteredVocabularies.length === 0 ? (
        <p className="text-gray-500">Không tìm thấy từ nào.</p>
      ) : (
        <ul className="space-y-6">
          {filteredVocabularies.map((vocab) => (
            <li
              key={vocab.id}
              className="flex gap-6 items-center bg-white shadow-md rounded-lg p-4"
            >
              {vocab.image && (
                <img
                  src={vocab.image}
                  alt={vocab.word}
                  className="w-20 h-20 object-contain rounded-md flex-shrink-0"
                />
              )}

              <div className="flex-1">
                {editingId === vocab.id ? (
                  <>
                    <input
                      type="text"
                      name="word"
                      value={editForm.word || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Word"
                    />
                    <textarea
                      name="definitionEn"
                      value={editForm.definitionEn || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="English Definition"
                      rows={2}
                    />
                    <input
                      type="text"
                      name="meaningVi"
                      value={editForm.meaningVi || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Meaning (Vietnamese)"
                    />
                    <input
                      type="text"
                      name="exampleEn"
                      value={editForm.exampleEn || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Example (English)"
                    />
                    <input
                      type="text"
                      name="exampleVi"
                      value={editForm.exampleVi || ""}
                      onChange={handleChange}
                      className="border border-gray-300 rounded px-2 py-1 w-full mb-1"
                      placeholder="Example (Vietnamese)"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2 text-lg font-bold">
                      <span>{vocab.word}</span>
                      {vocab.pronunciation && (
                        <em className="text-gray-500 ml-2">{vocab.pronunciation}</em>
                      )}
                      {vocab.partOfSpeech && (
                        <span className="italic text-gray-400 ml-3">
                          ({vocab.partOfSpeech})
                        </span>
                      )}
                    </div>

                    {vocab.definitionEn && (
                      <p className="text-gray-700 text-sm mt-1">{vocab.definitionEn}</p>
                    )}

                    <p className="mt-1">
                      <strong>VI:</strong> {vocab.meaningVi}
                    </p>
                    <p className="mt-1 text-gray-600 text-sm">
                      <strong>EN Example:</strong> {vocab.exampleEn}
                    </p>
                    <p className="mt-1 text-gray-600 text-sm">
                      <strong>VI Example:</strong> {vocab.exampleVi}
                    </p>

                    {vocab.audio && (
                      <audio
                        controls
                        src={vocab.audio}
                        className="mt-3 w-full max-w-xs"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2 min-w-[70px]">
                {editingId === vocab.id ? (
                  <>
                    <button
                      onClick={() => handleSave(vocab.id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm transition"
                    >
                      Done
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-400 hover:bg-gray-500 text-white py-1 px-3 rounded-md text-sm transition"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(vocab)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(vocab.id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition"
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Vocabulary;
