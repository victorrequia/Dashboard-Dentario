import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography'; // Importar Typography

import { RouterLink } from 'src/routes/components';

const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  const logoAndText = (
    <Box
      sx={{
        display: 'flex', // Usar flex para alinhar logo e texto lado a lado
        alignItems: 'center', // Centralizar verticalmente
        borderColor: 'divider', // Usa a cor de divisão padrão do tema para a linha
        ...sx,
      }}
      {...other}
    >
      <Box
        ref={ref}
        component="img"
        src="/assets/logo_udesc.png" // Ajuste conforme o caminho correto do seu logo
        sx={{
          width: 52,
          height: 46,
          cursor: 'pointer',
        }}
      />
      <Typography
        variant="body2" // Usa uma variante de texto menor
        color="textPrimary" // Define a cor do texto para preto. Use "color='black'" se "textPrimary" não for preto.
        sx={{ ml: 1, fontSize: '0.875rem' }} // Adiciona margem à esquerda e define o tamanho da fonte diretamente se necessário
      >
        Universidade do Estado de Santa Catarina
      </Typography>
    </Box>
  );

  if (disabledLink) {
    return logoAndText;
  }

  return (
    <Link component={RouterLink} to="/" sx={{ display: 'contents' }}>
      {logoAndText}
    </Link>
  );
});

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default Logo;