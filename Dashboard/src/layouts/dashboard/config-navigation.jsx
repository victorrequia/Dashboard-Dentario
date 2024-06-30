import MovingSharpIcon from '@mui/icons-material/MovingSharp';
import SolarPowerOutlinedIcon from '@mui/icons-material/SolarPowerOutlined';
import ElectricMeterOutlinedIcon from '@mui/icons-material/ElectricMeterOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';
// ----------------------------------------------------------------------
const navConfig = [
  {
    title: 'Previsao',
    path: '/',
    icon: <MovingSharpIcon sx={{ width: 1, height: 1 }} />
  },
  {
    title: 'Ambiente',
    path: 'environment',
    icon: <SolarPowerOutlinedIcon sx={{ width: 1, height: 1 }} />,
  },
  {
    title: 'Servidor',
    path: 'server',
    icon: <DeveloperBoardOutlinedIcon sx={{ width: 1, height: 1 }} />
  },
  {
    title: 'Inversor',
    path: 'inverter',
    icon: <ElectricMeterOutlinedIcon sx={{ width: 1, height: 1 }} />
  }
  /* {
    title: 'user',
    path: '/user',
    icon: icon('ic_user'),
  },
  {
    title: 'product',
    path: '/products',
    icon: icon('ic_cart'),
  },
  {
    title: 'blog',
    path: '/blog',
    icon: icon('ic_blog'),
  },
  {
    title: 'login',
    path: '/login',
    icon: icon('ic_lock'),
  },
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic_disabled'),
  }, */
];

export default navConfig;
