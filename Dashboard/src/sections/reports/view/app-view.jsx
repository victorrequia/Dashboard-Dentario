import mqtt from 'mqtt';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2'; // Verifique se está correto conforme a versão do MUI
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#007BFF' },
    secondary: { main: '#FFC107' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
  typography: {
    fontFamily: 'Comic Neue, Arial, sans-serif',
    h6: { fontSize: '1.25rem' },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: '15px', boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .1)' },
      },
    },
  },
});

// Conecta ao broker MQTT na porta 9001 usando WebSocket
const client = mqtt.connect('ws://localhost:9001');

client.on('connect', () => {
  console.log('Conectado ao broker MQTT!');
  client.subscribe('topico/resposta', (err) => {
    if (!err) {
      console.log('Inscrito no tópico topico/resposta');
    }
  });
});

const publishMessage = (message) => {
  const payload = JSON.stringify({ informacao: message });
  const topic = 'topico/teste';
  client.publish(topic, payload, () => {
    console.log(`Publicado: ${payload} no tópico ${topic}`);
  });
};

const DataTable = ({ rows }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Event Type</TableCell>
          <TableCell>Report Number</TableCell>
          <TableCell>Patient Info</TableCell>
          <TableCell>Device Operator</TableCell>
          <TableCell>Device Product Code Name</TableCell>
          <TableCell>Brand Generic Name</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.event_type}</TableCell>
            <TableCell>{row.report_number}</TableCell>
            <TableCell>
              {row.patient.map((patient, idx) => (
                <div key={idx}>
                  <div>Date Received: {patient.date_received}</div>
                  <div>Age: {patient.patient_age}</div>
                  <div>Ethnicity: {patient.patient_ethnicity}</div>
                  <div>Problems: {JSON.stringify(patient.patient_problems)}</div>
                  <div>Race: {patient.patient_race}</div>
                  <div>Sequence Number: {patient.patient_sequence_number}</div>
                  <div>Sex: {patient.patient_sex}</div>
                  <div>Weight: {patient.patient_weight}</div>
                  <div>Outcome: {JSON.stringify(patient.sequence_number_outcome)}</div>
                  <div>Treatment: {JSON.stringify(patient.sequence_number_treatment)}</div>
                  <Divider sx={{ my: 1 }} />
                </div>
              ))}
            </TableCell>
            <TableCell>{row['device.device_operator']}</TableCell>
            <TableCell>{row['new_device.device_product_code_name']}</TableCell>
            <TableCell>{row['new_device.brand_generic_name']}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

DataTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default function AppView() {
  const [klcData, setKlcData] = useState([]);

  useEffect(() => {
    client.on('message', (topic, message) => {
      console.log(`Mensagem recebida: ${message.toString()} no tópico ${topic}`);
      const jsonData = JSON.parse(message.toString());
      setKlcData(jsonData);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button variant="contained" color="primary" onClick={() => publishMessage('KLC')}>KLC</Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" onClick={() => publishMessage('LZD')}>LZD</Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" onClick={() => publishMessage('EKZ')}>EKZ</Button>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Dados Filtrados</Typography>
                <DataTable rows={klcData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}