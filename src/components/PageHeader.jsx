import { Box, Typography } from '@mui/material';

/** Section heading with optional action buttons that wrap on small screens. */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" component="h2">{title}</Typography>
        {subtitle && <Typography component="div" variant="body2" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {actions && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{actions}</Box>}
    </Box>
  );
}
