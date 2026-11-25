import { Box, Paper, Typography } from '@mui/material';

export default function StatCard({ label, value, caption, icon, color = 'primary.main', to, onClick }) {
  return (
    <Paper
      onClick={onClick}
      sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', cursor: onClick ? 'pointer' : 'default', minWidth: 0, position: 'relative', overflow: 'hidden', transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease', backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(255,122,24,0.09), transparent 48%)', '&:hover': onClick ? { borderColor: 'rgba(255,162,74,0.55)', transform: 'translateY(-2px)', boxShadow: '0 14px 34px rgba(0,0,0,0.3), 0 0 22px rgba(255,122,24,0.08)' } : undefined }}
    >
      <Box
        sx={{
          width: 44, height: 44, borderRadius: 2, flexShrink: 0, display: 'grid', placeItems: 'center',
          color, bgcolor: 'rgba(255,122,24,0.12)', border: '1px solid rgba(255,162,74,0.16)',
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
