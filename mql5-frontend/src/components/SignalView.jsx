import React from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box,
    Tabs,
    Tab
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const SignalView = ({ data }) => {
    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                {/* Верхняя карточка */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h4">{data.generalInfo.signalName}</Typography>
                        <Typography variant="subtitle1">{data.generalInfo.author}</Typography>
                        <Typography variant="body1">{data.generalInfo.reliability}</Typography>
                    </Paper>
                </Grid>

                {/* Основные метрики */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6">Основные показатели</Typography>
                        <Grid container spacing={2}>
                            {Object.entries(data.generalInfo).map(([key, value]) => (
                                <Grid item xs={6} key={key}>
                                    <Typography variant="body2" color="textSecondary">
                                        {key}
                                    </Typography>
                                    <Typography variant="body1">
                                        {value}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Статистика */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6">Статистика</Typography>
                        <Grid container spacing={2}>
                            {Object.entries(data.statistics).map(([key, value]) => (
                                <Grid item xs={6} key={key}>
                                    <Typography variant="body2" color="textSecondary">
                                        {key}
                                    </Typography>
                                    <Typography variant="body1">
                                        {value}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Вкладки */}
                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Распределение" />
                            <Tab label="История сделок" />
                            <Tab label="Графики" />
                        </Tabs>
                        
                        <Box sx={{ p: 2 }}>
                            {tabValue === 0 && (
                                <Grid container spacing={2}>
                                    {data.distribution.map((item, index) => (
                                        item.symbol && (
                                            <Grid item xs={12} key={index}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography sx={{ width: '100px' }}>
                                                        {item.symbol}
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            flexGrow: 1,
                                                            bgcolor: 'grey.300',
                                                            height: 20,
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                left: 0,
                                                                top: 0,
                                                                bottom: 0,
                                                                bgcolor: 'primary.main',
                                                                width: `${item.percentage}%`
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography sx={{ width: '100px', textAlign: 'right' }}>
                                                        {item.value}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        )
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default SignalView; 