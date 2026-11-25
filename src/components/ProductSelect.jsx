import { Autocomplete, TextField } from '@mui/material';

/**
 * Searchable product picker (works well with 100+ products).
 * `products` is the list of selectable products; value/onChange use the product id.
 */
export default function ProductSelect({ products, value, onChange, label = 'Product', required, error, helperText, size, disabled }) {
  const selected = products.find((p) => p.id === value) || null;
  return (
    <Autocomplete
      size={size}
      disabled={disabled}
      options={products}
      value={selected}
      onChange={(_, p) => onChange(p ? p.id : '')}
      getOptionLabel={(p) => `${p.code} — ${p.name}`}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => (
        <TextField {...params} label={label} required={required} error={Boolean(error)} helperText={helperText} />
      )}
      noOptionsText="No matching products"
    />
  );
}
