import React, { useEffect, useState } from "react";
import config from "../../config/config";

interface ArticleItem {
  id: number;
  title: string;
  content: string;
  image: string;
  audio: string;
  category: { id: number; name: string };
  createdAt: string;
}

export default function Article() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const size = 4;

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          `${config}admin/articles?page=${page}&size=${size}&sort=id,asc`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const json = await res.json();
        setArticles(json.data.result);
        setTotalPages(json.data.meta.pages);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      }
    };

    fetchArticles();
  }, [page]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📰 Danh sách bài viết</h1>
      <div>
        <input
          type="text"
          placeholder="🔍 Tìm bài viết..."
          className="mb-6 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lưới bài viết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden p-4 flex flex-col"
          >
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              {article.title}
            </h2>

            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}

            <div
              className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-4 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.audio && (
              <audio controls className="mb-3">
                <source src={article.audio} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ audio.
              </audio>
            )}

            <div className="text-xs text-gray-500 mt-auto">
              <p>📂 {article.category.name}</p>
              <p>🕒 {new Date(article.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          ⬅️ Trang trước
        </button>
        <span className="font-medium">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Trang sau ➡️
        </button>
      </div>
    </div>
  );
}
