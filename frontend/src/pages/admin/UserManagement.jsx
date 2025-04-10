import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Button,
  Box,
  Chip,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { userApi } from '../../services/api/user';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api/admin';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SignalAssignmentModal from '../../components/admin/SignalAssignmentModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [signalModalOpen, setSignalModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllUsers();
      if (response?.data) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenSignalModal = (user) => {
    setSelectedUser(user);
    setSignalModalOpen(true);
  };

  const handleCloseSignalModal = () => {
    setSignalModalOpen(false);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Управление пользователями</Typography>
        <Tooltip title="Добавить пользователя">
          <IconButton>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 3 }}
      >
        <TextField
          size="small"
          placeholder="Поиск пользователя..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Stack direction="row" spacing={1}>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
          >
            Обновить
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
          >
            Фильтр
          </Button>
        </Stack>
      </Stack>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Имя пользователя</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role === 'admin' ? 'Администратор' : 'Пользователь'} 
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                        variant="soft"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status === 'active' ? 'Активен' : 'Неактивен'} 
                        color={user.status === 'active' ? 'success' : 'warning'}
                        size="small"
                        variant="soft"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Назначить сигнал">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenSignalModal(user)}
                          >
                            <PersonAddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ещё действия">
                          <IconButton size="small">
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" paragraph>
                          Пользователи не найдены
                        </Typography>
                        <Typography variant="body2">
                          Не найдено пользователей по запросу &nbsp;
                          <strong>&quot;{searchTerm}&quot;</strong>.
                          <br /> Попробуйте проверить опечатки или использовать другие слова.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Модальное окно назначения сигнала */}
      {selectedUser && (
        <SignalAssignmentModal
          open={signalModalOpen}
          onClose={handleCloseSignalModal}
          userId={selectedUser.id}
          userName={selectedUser.username || selectedUser.email}
        />
      )}
    </Container>
  );
}
