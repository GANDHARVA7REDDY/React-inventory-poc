import { useMemo } from 'react';
import { RECORD_STATUS } from '../domain/constants.js';
import { saveCategory, setCategoryStatus } from '../domain/commands.js';
import { useInventory } from '../context/InventoryContext.jsx';
import MasterDataManager from '../components/MasterDataManager.jsx';

const FIELDS = [
  { name: 'code', label: 'Category Code', required: true, maxLength: 20 },
  { name: 'name', label: 'Category Name', required: true, maxLength: 60 },
  { name: 'description', label: 'Description', multiline: true, maxLength: 250 },
];

export default function Categories() {
  const { categories, products } = useInventory();
  const rows = useMemo(
    () => categories.map((c) => ({
      ...c,
      activeProducts: products.filter((p) => p.categoryId === c.id && p.status === RECORD_STATUS.ACTIVE).length,
    })),
    [categories, products],
  );
  const columns = [
    { key: 'description', label: 'Description', hideBelow: 'md', render: (r) => r.description || '—' },
    { key: 'activeProducts', label: 'Active Products', align: 'right' },
  ];
  return (
    <MasterDataManager
      entity="category" rows={rows} columns={columns} fields={FIELDS}
      saveCommand={saveCategory} statusCommand={setCategoryStatus}
    />
  );
}
