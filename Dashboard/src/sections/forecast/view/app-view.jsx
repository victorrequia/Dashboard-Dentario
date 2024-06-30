import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2'; // Esta importação pode precisar ser atualizada dependendo da versão do MUI

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import AirIcon from '@mui/icons-material/Air';
import Typography from '@mui/material/Typography';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import OpacityIcon from '@mui/icons-material/Opacity';
import CompressIcon from '@mui/icons-material/Compress';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// ----------------------------------------------------------------------
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#ffc107' },
    background: { paper: '#0000' },
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
});

const WeatherAttribute = ({ icon: Icon, label, value }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Icon sx={{ verticalAlign: 'bottom' }} />
    <Typography variant="h6">{value}</Typography>
    <Typography variant="caption">{label}</Typography>
  </Box>
);

WeatherAttribute.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

const WeatherView = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await axios('https://lora-placa-solar-server-proxy.onrender.com/previsao/joinville');
      setWeatherData(data);
      setError(false);
    } catch (apiError) {
      console.error('Erro ao buscar dados:', apiError);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1800000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <Container><Typography variant="h6">Erro ao carregar os dados.</Typography></Container>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 2 }}>
          {loading ? (
            <CircularProgress />
          ) : (
            <Box>
              <Typography variant="h4" align="center" gutterBottom sx={{ p: 4 }} >
                Tempo agora para {weatherData.name}, {weatherData.state}
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={6} lg={4} sx={{ textAlign: 'center' }}>
                  <WbSunnyIcon sx={{ fontSize: 80, color: '#ffeb3b' }} />
                  <Typography variant="h5">{weatherData.data.condition}</Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={8}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                    <WeatherAttribute icon={ThermostatIcon} label="Temperatura" value={`${weatherData.data.temperature}°C`} />
                    <WeatherAttribute icon={OpacityIcon} label="Umidade" value={`${weatherData.data.humidity}%`} />
                    <WeatherAttribute icon={AirIcon} label="Vento" value={weatherData.data.wind_direction} />
                    <WeatherAttribute icon={CompressIcon} label="Pressão" value={`${weatherData.data.pressure} hPa`} />
                  </Box>
                </Grid>
              </Grid>
              <Typography variant="caption" display="block" align="right" sx={{ mt: 2 }}>
                Última atualização: {weatherData.data.date}
              </Typography>
              <Typography variant="caption" display="block" align="right">
                Fonte: Clima Tempo
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default WeatherView;