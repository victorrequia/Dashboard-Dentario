import io from 'socket.io-client';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2'; // Esta importação pode precisar ser atualizada dependendo da versão do MUI

import axios from 'axios';
import { Line, XAxis, YAxis, Legend, Tooltip, LineChart, CartesianGrid, ResponsiveContainer } from 'recharts';

import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AlbumIcon from '@mui/icons-material/Album';
import MemoryIcon from '@mui/icons-material/Memory';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PowerOutlinedIcon from '@mui/icons-material/PowerOutlined';
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
      <Line type="monotone" dataKey="cpu" name="CPU (%)" stroke="#f44336" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="memory" name="Memória (%)" stroke="#2196f3" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="disk" name="Disco (%)" stroke="#ff9800" activeDot={{ r: 8 }} />
    </LineChart>
  </ResponsiveContainer>
);

const PowerChart = ({ data }) => (
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
      <Line type="monotone" dataKey="cpuPackage" name="Potência CPU (W)" stroke="#00e676" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="cpuDram" name="Potência Memória (W)" stroke="#9c27b0" activeDot={{ r: 8 }} />
    </LineChart>
  </ResponsiveContainer>
);

RealTimeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

PowerChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

SensorCard.propTypes = {
  icon: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  lastUpdate: PropTypes.string,
};

export default function AppView() {
  const [cpuUsage, setCpuUsage] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [diskUsage, setDiskUsage] = useState(null);
  const [cpuPackage, setCpuPackage] = useState(null);
  const [cpuDram, setCpuDram] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [data, setData] = useState([]);

  const socket = io('https://lora-placa-solar-server-proxy.onrender.com');

  useEffect(() => {
    socket.on('mqtt message', (message) => {
      const now = new Date();
      const jsonData = JSON.parse(message);

      console.log(jsonData);

      const cpuTotalLoad = parseFloat(jsonData.ohm_data['Load CPU']['CPU Total']);
      setCpuUsage(cpuTotalLoad);
      setMemoryUsage(parseFloat(jsonData.memory));
      setDiskUsage(parseFloat(jsonData.disk));
      setCpuPackage(parseFloat(jsonData.ohm_data['CPU Package']));
      setCpuDram(parseFloat(jsonData.ohm_data['CPU DRAM']));
      setLastUpdate(now.toLocaleTimeString());

      const newEntry = {
        time: now,
        cpu: cpuTotalLoad,
        memory: parseFloat(jsonData.memory),
        disk: parseFloat(jsonData.disk),
        cpuPackage: parseFloat(jsonData.ohm_data['CPU Package']),
        cpuDram: parseFloat(jsonData.ohm_data['CPU DRAM']),
      };

      setData(currentData => [...currentData.slice(-9), newEntry]);
    });

    return () => {
      socket.off('mqtt message');
    };
  }, [socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Respdsa");
        const response = await axios.get('https://lora-placa-solar-server-proxy.onrender.com/servidor');
        console.log("Resposta: ", response);
        const formattedData = response.data.map(item => {
          const [date, time] = item.timestamp.split(', ');
          const [day, month, year] = date.split('/');
          const [hours, minutes, seconds] = time.split(':');
          const timestamp = new Date(year, month - 1, day, hours, minutes, seconds);

          return {
            time: timestamp,
            cpu: parseFloat(item.ohm_data['Load CPU']['CPU Total']),
            memory: parseFloat(item.memory),
            disk: parseFloat(item.disk),
            cpuPackage: parseFloat(item.ohm_data['CPU Package']),
            cpuDram: parseFloat(item.ohm_data['CPU DRAM']),
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
          {/* CPU Usage Card */}
          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<MemoryIcon style={{ fontSize: '3rem', color: '#feb236' }} />}
              title="Uso de CPU"
              value={cpuUsage !== null ? `${cpuUsage.toFixed(2)} %` : 'Loading...'}
              loading={cpuUsage === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          {/* Memory Usage Card */}
          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<SpeedOutlinedIcon style={{ fontSize: '3rem', color: '#4caf50' }} />}
              title="Uso de Memória"
              value={memoryUsage !== null ? `${memoryUsage.toFixed(2)} %` : 'Loading...'}
              loading={memoryUsage === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          {/* Disk Usage Card */}
          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<AlbumIcon style={{ fontSize: '3rem', color: '#988858' }} />}
              title="Uso de Disco"
              value={diskUsage !== null ? `${diskUsage.toFixed(2)} %` : 'Loading...'}
              loading={diskUsage === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          {/* CPU Package Card */}
          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<PowerOutlinedIcon style={{ fontSize: '3rem', color: 'green' }} />}
              title="Potência CPU"
              value={cpuPackage !== null ? `${cpuPackage.toFixed(2)} W` : 'Loading...'}
              loading={cpuPackage === null}
              lastUpdate={lastUpdate}
            />
          </Grid>

          {/* CPU DRAM Card */}
          <Grid item xs={12} sm={6} md={4}>
            <SensorCard
              icon={<PowerOutlinedIcon style={{ fontSize: '3rem', color: 'grey' }} />}
              title="Potência Memória"
              value={cpuDram !== null ? `${cpuDram.toFixed(2)} W` : 'Loading...'}
              loading={cpuDram === null}
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

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <PowerChart data={data} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}