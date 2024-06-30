import axios from 'axios';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import PowerOutlinedIcon from '@mui/icons-material/PowerOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import DeviceThermostatOutlinedIcon from '@mui/icons-material/DeviceThermostatOutlined';

// ----------------------------------------------------------------------
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

const RealTimeChart = ({ data, lines }) => (
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
      <Tooltip
        labelFormatter={(label) => {
          const date = new Date(label);
          return date.toLocaleTimeString();
        }}
      />
      <Legend verticalAlign="bottom" height={36} />
      {lines.map((line) => (
        <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} name={line.name} stroke={line.stroke} activeDot={{ r: 8 }} />
      ))}
    </LineChart>
  </ResponsiveContainer>
);

RealTimeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  lines: PropTypes.arrayOf(PropTypes.shape({
    dataKey: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    stroke: PropTypes.string.isRequired,
  })).isRequired,
};

export { SensorCard, RealTimeChart };

export default function AppView() {
  const [Pac, setPac] = useState(null);
  const [Vpv1, setVpv1] = useState(null);
  const [Vac1, setVac1] = useState(null);
  const [Ipv1, setIpv1] = useState(null);
  const [Iac1, setIac1] = useState(null);
  const [EDay, setEDay] = useState(null);
  const [Temperature, setTemperature] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [inverterData, setInverterData] = useState([]);

  const socket = io('https://lora-placa-solar-server-proxy.onrender.com');

  // Função para converter timestamp do formato brasileiro para um objeto Date
  const convertToDate = (timestamp) => {
    const [date, time] = timestamp.split(', ');
    const [day, month, year] = date.split('/');
    const [hours, minutes, seconds] = time.split(':');
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  useEffect(() => {
    socket.on('mqtt message3', (message) => {
      const now = new Date();
      const nowTimeStr = now.toLocaleTimeString();
      const jsonData = JSON.parse(message);

      if (jsonData.Pac !== undefined) {
        setPac(jsonData.Pac);
        setVpv1(jsonData.Vpv1);
        setVac1(jsonData.Vac1);
        setIpv1(jsonData.Ipv1);
        setIac1(jsonData.Iac1);
        setEDay(jsonData.EDay);
        setTemperature(jsonData.Temperature);
        setLastUpdate(nowTimeStr);

        const newInverterEntry = {
          time: now.toISOString(), // Armazenar o timestamp completo
          Pac: jsonData.Pac,
          Vpv1: jsonData.Vpv1,
          Vac1: jsonData.Vac1,
          Ipv1: jsonData.Ipv1,
          Iac1: jsonData.Iac1,
          EDay: jsonData.EDay,
          Temperature: jsonData.Temperature,
        };

        setInverterData(currentData => [...currentData.slice(-9), newInverterEntry]);
      }
    });

    return () => {
      socket.off('mqtt message3');
    };
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inverterResponse = await axios.get('https://lora-placa-solar-server-proxy.onrender.com/inversor');
        console.log("Resposta: ", inverterResponse);
        const formattedInverterData = inverterResponse.data.map(item => ({
          time: convertToDate(item.timestamp).toISOString(), // Converter timestamp
          Pac: item.Pac,
          Vpv1: item.Vpv1,
          Vac1: item.Vac1,
          Ipv1: item.Ipv1,
          Iac1: item.Iac1,
          EDay: item.EDay,
          Temperature: item.Temperature,
        })).reverse();
        setInverterData(formattedInverterData);
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
          {/* Inverter Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<PowerOutlinedIcon style={{ fontSize: '3rem', color: '#f44336' }} />}
              title="Potência de Saída (Pac)"
              value={Pac !== null ? `${Pac} W` : 'Loading...'}
              loading={Pac === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<FlashOnOutlinedIcon style={{ fontSize: '3rem', color: '#2196f3' }} />}
              title="Tensão de Entrada (Vpv1)"
              value={Vpv1 !== null ? `${Vpv1} V` : 'Loading...'}
              loading={Vpv1 === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<FlashOnOutlinedIcon style={{ fontSize: '3rem', color: '#ff5722' }} />}
              title="Tensão de Saída (Vac1)"
              value={Vac1 !== null ? `${Vac1} V` : 'Loading...'}
              loading={Vac1 === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<OpacityOutlinedIcon style={{ fontSize: '3rem', color: '#ff9800' }} />}
              title="Corrente de Entrada (Ipv1)"
              value={Ipv1 !== null ? `${Ipv1} A` : 'Loading...'}
              loading={Ipv1 === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<OpacityOutlinedIcon style={{ fontSize: '3rem', color: '#4caf50' }} />}
              title="Corrente de Saída (Iac1)"
              value={Iac1 !== null ? `${Iac1} A` : 'Loading...'}
              loading={Iac1 === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<SpeedOutlinedIcon style={{ fontSize: '3rem', color: '#8bc34a' }} />}
              title="Energia Produzida por Dia (EDay)"
              value={EDay !== null ? `${EDay} kWh` : 'Loading...'}
              loading={EDay === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<DeviceThermostatOutlinedIcon style={{ fontSize: '3rem', color: '#ff5722' }} />}
              title="Temperatura do Inversor"
              value={Temperature !== null ? `${Temperature} °C` : 'Loading...'}
              loading={Temperature === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          {/* Inverter Data Charts */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <RealTimeChart 
                  data={inverterData} 
                  lines={[
                    { dataKey: 'Vpv1', name: 'Tensão de Entrada (Vpv1)', stroke: '#2196f3' },
                    { dataKey: 'Vac1', name: 'Tensão de Saída (Vac1)', stroke: '#ff5722' },
                  ]} 
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <RealTimeChart 
                  data={inverterData} 
                  lines={[
                    { dataKey: 'Ipv1', name: 'Corrente de Entrada (Ipv1)', stroke: '#ff9800' },
                    { dataKey: 'Iac1', name: 'Corrente de Saída (Iac1)', stroke: '#4caf50' },
                  ]} 
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <RealTimeChart 
                  data={inverterData} 
                  lines={[
                    { dataKey: 'Pac', name: 'Potência de Saída (Pac)', stroke: '#f44336' },
                  ]} 
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <RealTimeChart 
                  data={inverterData} 
                  lines={[
                    { dataKey: 'EDay', name: 'Energia Produzida por Dia (EDay)', stroke: '#8bc34a' },
                  ]} 
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <RealTimeChart 
                  data={inverterData} 
                  lines={[
                    { dataKey: 'Temperature', name: 'Temperatura do Inversor (°C)', stroke: '#ff5722' },
                  ]} 
                />
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>
    </ThemeProvider>
  );
}