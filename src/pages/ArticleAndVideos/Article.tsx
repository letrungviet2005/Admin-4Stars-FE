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
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(
          config + "admin/articles?page=1&size=2&sort=id,asc",
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
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📰 Danh sách bài viết</h1>
      {articles.map((article) => (
        <div
          key={article.id}
          className="mb-10 p-4 border border-gray-200 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold text-blue-700 mb-2">
            {article.title}
          </h2>

          {article.image && (
            <img
              src={article.image}
              alt={article.title}
              className="w-full max-h-60 object-cover rounded mb-3"
            />
          )}

          <div
            className="text-gray-700 text-sm leading-relaxed mb-3"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.audio && (
            <audio controls className="mb-3">
              <source src={article.audio} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ audio.
            </audio>
          )}

          <div className="text-xs text-gray-500">
            <p>📂 Danh mục: {article.category.name}</p>
            <p>🕒 Ngày đăng: {new Date(article.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
