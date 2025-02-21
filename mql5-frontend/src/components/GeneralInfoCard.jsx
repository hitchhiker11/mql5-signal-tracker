import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const GeneralInfoCard = ({ data }) => (
    <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Основные показатели</Typography>
            <Grid container spacing={2}>
                {Object.entries(data).map(([key, value]) => (
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
);

export default GeneralInfoCard; 