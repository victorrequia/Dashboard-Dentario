import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/reports/view';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> Trabalho Final </title>
      </Helmet>

      <AppView />
    </>
  );
}
