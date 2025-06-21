import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import config from "../../../config/config";

interface Role {
  id: number;
  name: string;
}

interface BadgeInfo {
  id: number;
  name: string;
  image: string;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  active: boolean;
  point: number;
  createdAt: string;
  role: Role;
  badge: BadgeInfo;
}

export default function UserTable() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const size = 3;
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${config}admin/users?page=${page}&size=${size}&sort=id,asc`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const json = await res.json();
        setUsers(json.data.result);
        setTotalPages(json.data.meta.pages);
      } catch (err) {
        console.error("Lỗi khi tải người dùng:", err);
      }
    };

    fetchUsers();
  }, [page]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-gray-500"
              >
                Tên
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-gray-500"
              >
                Email
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-gray-500"
              >
                Vai trò
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-gray-500"
              >
                Huy hiệu
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-gray-500"
              >
                Điểm
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-start text-gray-500"
              >
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white">
                  {user.name}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-gray-600 dark:text-gray-300">
                  {user.email}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-gray-600 dark:text-gray-300">
                  {user.role.name}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  {user.badge ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={user.badge.image}
                        alt={user.badge.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {user.badge.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Không có huy hiệu
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-5 py-4 text-start text-gray-600 dark:text-gray-300">
                  {user.point}
                </TableCell>
                <TableCell className="px-5 py-4 text-start">
                  <Badge color={user.active ? "success" : "error"} size="sm">
                    {user.active ? "Hoạt động" : "Vô hiệu"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      <div className="flex justify-center items-center gap-4 py-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          ⬅️ Trước
        </button>
        <span className="font-medium">
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Tiếp ➡️
        </button>
      </div>
    </div>
  );
}
