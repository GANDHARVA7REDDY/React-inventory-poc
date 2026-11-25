import { Alert, AlertTitle, Box, Button, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';

/** Shown instead of the app when saved data is missing, damaged or storage is unavailable. Nothing is overwritten automatically. */
export default function DataErrorScreen({ kind, errors, message, onRetry, onDownload, onReset }) {
  const unavailable = kind === 'unavailable';
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Paper sx={{ maxWidth: 640, width: '100%', p: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" gutterBottom>
          {unavailable ? 'Browser storage is unavailable' : 'Saved inventory data needs attention'}
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>{unavailable ? 'Cannot read or write data' : 'Your saved data was not loaded'}</AlertTitle>
          {unavailable
            ? 'This POC stores everything in browser localStorage. Enable site storage (or leave private browsing) and retry.'
            : 'Nothing has been changed or deleted. Review the problems below, then choose how to continue.'}
        </Alert>
        <List dense disablePadding>
          {errors.map((e) => (
            <ListItem key={e.key} disableGutters>
              <ListItemText primary={e.key === '*' ? 'Storage' : e.key} secondary={e.reason} />
            </ListItem>
          ))}
        </List>
        {message && <Alert severity="info" sx={{ my: 2 }}>{message}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={onRetry}>Retry</Button>
          {!unavailable && <Button variant="outlined" onClick={onDownload}>Download raw data</Button>}
          {!unavailable && (
            <Button variant="outlined" color="error" onClick={onReset}>
              Back up &amp; reset to sample data
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
