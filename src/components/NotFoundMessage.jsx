import { Alert, AlertTitle, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundMessage({ title = 'Not found', message, backTo = '/', backLabel = 'Back to dashboard' }) {
  return (
    <Alert severity="warning" sx={{ maxWidth: 640 }} action={<Button component={RouterLink} to={backTo} color="inherit" size="small">{backLabel}</Button>}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}
