import React, { useState } from 'react';
import { Container, TextField, Button, Box } from '@mui/material';
import SignalView from './components/SignalView';
import { signalService } from './services/api';

function App() {
    const [signalUrl, setSignalUrl] = useState('');
    const [signalData, setSignalData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await signalService.getSignal(signalUrl);
            setSignalData(data);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <form onSubmit={handleSubmit}>
                    <TextField 
                        fullWidth
                        label="URL сигнала"
                        value={signalUrl}
                        onChange={(e) => setSignalUrl(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button 
                        variant="contained" 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : 'Получить данные'}
                    </Button>
                </form>
            </Box>
            {signalData && <SignalView data={signalData} />}
        </Container>
    );
}

export default App;
