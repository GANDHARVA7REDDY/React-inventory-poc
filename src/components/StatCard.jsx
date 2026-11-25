import { Box, Paper, Typography } from '@mui/material';

export default function StatCard({ label, value, caption, icon, color = 'primary.main', to, onClick }) {
  return (
    <Paper
      onClick={onClick}
      sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', cursor: onClick ? 'pointer' : 'default', minWidth: 0, '&:hover': onClick ? { borderColor: color } : undefined }}
    >
      <Box
        sx={{
          width: 44, height: 44, borderRadius: 2, flexShrink: 0, display: 'grid', placeItems: 'center',
          color, bgcolor: 'action.hover',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
        <Typography variant="h5" sx={{ lineHeight: 1.2, overflowWrap: 'anywhere' }}>{value}</Typography>
        {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
      </Box>
    </Paper>
  );
}
