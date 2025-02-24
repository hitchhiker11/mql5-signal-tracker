import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography } from '@mui/material';
import SignalView from './components/SignalView';
import { signalService } from './services/api';

function App() {
    const [signalUrl, setSignalUrl] = useState('');
    const [signalData, setSignalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await signalService.getSignal(signalUrl);
            console.log('dsf');
            setSignalData(data);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                {import.meta.env.VITE_APP_NAME}
                </Typography>
                
                <form onSubmit={handleSubmit}>
                    <TextField 
                        fullWidth
                        label="Введите URL сигнала MQL5"
                        value={signalUrl}
                        onChange={(e) => setSignalUrl(e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder="https://www.mql5.com/ru/signals/1234567"
                    />
                    <Button 
                        variant="contained" 
                        type="submit"
                        disabled={loading}
                        sx={{ mb: 2 }}
                    >
                        {loading ? 'Загрузка...' : 'Получить данные'}
                    </Button>
                </form>

                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        Ошибка: {error}
                    </Typography>
                )}

                {loading && (
                    <Typography sx={{ mt: 2 }}>
                        Загрузка данных...
                    </Typography>
                )}

                {signalData && <SignalView data={signalData} />}
                
            </Box>
        </Container>
    );
}

export default App;
