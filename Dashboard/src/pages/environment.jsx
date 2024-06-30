import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/ambiente/view';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> nPEE - Solar </title>
      </Helmet>

      <AppView />
    </>
  );
}
