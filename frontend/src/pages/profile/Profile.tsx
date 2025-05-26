import { Container, Typography, Paper, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Profile = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1">
            <strong>Name:</strong> {user?.name}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Email:</strong> {user?.email}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
