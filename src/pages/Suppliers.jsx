import { saveSupplier, setSupplierStatus } from '../domain/commands.js';
import { useInventory } from '../context/InventoryContext.jsx';
import MasterDataManager from '../components/MasterDataManager.jsx';

const FIELDS = [
  { name: 'code', label: 'Supplier Code', required: true, maxLength: 20 },
  { name: 'name', label: 'Supplier Name', required: true, maxLength: 100 },
  { name: 'contactPerson', label: 'Contact Person', maxLength: 100 },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', maxLength: 20 },
];

export default function Suppliers() {
  const { suppliers } = useInventory();
  const columns = [
    { key: 'contactPerson', label: 'Contact Person', hideBelow: 'md', render: (r) => r.contactPerson || '—' },
    { key: 'email', label: 'Email', hideBelow: 'lg', render: (r) => r.email || '—' },
    { key: 'phone', label: 'Phone', hideBelow: 'md', render: (r) => r.phone || '—' },
  ];
  return (
    <MasterDataManager
      entity="supplier" rows={suppliers} columns={columns} fields={FIELDS}
      saveCommand={saveSupplier} statusCommand={setSupplierStatus}
    />
  );
}
