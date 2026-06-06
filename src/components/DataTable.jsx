import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export const DataTable = ({ columns, data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {col.header}
              </th>
            ))}
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {columns.map((col) => (
                <td key={col.accessor} className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                  {row[col.accessor] ?? '-'}
                </td>
              ))}
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => onEdit(row)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(row.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
