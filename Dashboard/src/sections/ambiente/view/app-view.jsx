import io from 'socket.io-client';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2'; // Verifique se está correto conforme a versão do MUI
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ThermostatIcon from '@mui/icons-material/Thermostat'; // Ícone para temperatura
import WaterIcon from '@mui/icons-material/Water'; // Ícone para umidade
import WbSunnyIcon from '@mui/icons-material/WbSunny'; // Ícone para índice UV
import axios from 'axios';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007BFF',
    },
    secondary: {
      main: '#FFC107',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Comic Neue, Arial, sans-serif',
    h6: {
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .1)',
        },
      },
    },
  },
});

function SensorCard({ icon, title, value, loading, lastUpdate }) {
  return (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
      <Grid container spacing={2}>
        <Grid item>{icon}</Grid>
        <Grid item xs>
          <Typography variant="h6" component="h2">{title}</Typography>
          {loading ? <CircularProgress /> : <Typography variant="body1">{value}</Typography>}
          {!loading && lastUpdate && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Última atualização: {lastUpdate}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

SensorCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  lastUpdate: PropTypes.string,
};

const RealTimeChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="time"
        tickFormatter={(timeStr) => {
          const date = new Date(timeStr);
          return date.toLocaleTimeString();
        }}
      />
      <YAxis />
      <Tooltip />
      <Legend verticalAlign="bottom" height={36} />
      <Line type="monotone" dataKey="temperature" name="Temperatura (°C)" stroke="#f44336" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="humidity" name="Umidade (%)" stroke="#2196f3" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="uv" name="Índice UV" stroke="#ff9800" activeDot={{ r: 8 }} />
    </LineChart>
  </ResponsiveContainer>
);

RealTimeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
// Altere para exportação nomeada para evitar múltiplas exportações default
export { SensorCard, RealTimeChart };

export default function AppView() {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [uvIndex, setUvIndex] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [data, setData] = useState([]);

  const socket = io('https://lora-placa-solar-server-proxy.onrender.com');

  useEffect(() => {
    socket.on('mqtt message2', (message) => {
      const now = new Date();
      const jsonData = JSON.parse(message);
  
      setTemperature(jsonData.temperature);
      setHumidity(jsonData.humidity);
      setUvIndex(jsonData.uv);
      setLastUpdate(now.toLocaleTimeString());
  
      const newEntry = {
        time: now,
        temperature: jsonData.temperature,
        humidity: jsonData.humidity,
        uv: jsonData.uv,
      };
  
      // Atualiza o estado para incluir a nova entrada e manter apenas os últimos 10 registros
      setData(currentData => [...currentData.slice(-9), newEntry]);
    });
  
    return () => {
      socket.off('mqtt message2');
    };
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("resposta");
        const response = await axios.get('https://lora-placa-solar-server-proxy.onrender.com/ambiente'); // Ajuste a URL conforme necessário
        console.log("resposta: ", response);
        const formattedData = response.data.map(item => {
          const [date, time] = item.timestamp.split(', ');
          const [day, month, year] = date.split('/');
          const [hours, minutes, seconds] = time.split(':');
          const timestamp = new Date(year, month - 1, day, hours, minutes, seconds);

          return {
            time: timestamp,
            temperature: parseFloat(item.temperature),
            humidity: item.humidity,
            uv: item.uv,
          };
        }).reverse();
        setData(formattedData);
      } catch (error) {
        console.error('Erro ao buscar os dados:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<ThermostatIcon style={{ fontSize: '3rem', color: "#f44336" }} />}
              title="Temperatura"
              value={temperature !== null ? `${temperature} °C` : 'Carregando...'}
              loading={temperature === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<WaterIcon style={{ fontSize: '3rem', color: "#2196f3" }} />}
              title="Umidade"
              value={humidity !== null ? `${humidity} %` : 'Carregando...'}
              loading={humidity === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<WbSunnyIcon style={{ fontSize: '3rem', color: "#ff9800" }} />}
              title="Índice UV"
              value={uvIndex !== null ? `${uvIndex}` : 'Carregando...'}
              loading={uvIndex === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <RealTimeChart data={data} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}