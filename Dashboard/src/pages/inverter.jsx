import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/inverter/view';

// ----------------------------------------------------------------------

export default function InverterPage() {
  return (
    <>
      <Helmet>
        <title> nPEE - Solar </title>
      </Helmet>

      <AppView />
    </>
  );
}
