import { Helmet } from 'react-helmet-async';

import { AppView } from 'src/sections/servidor/view';

// ----------------------------------------------------------------------

export default function ServerPage() {
  return (
    <>
      <Helmet>
        <title> nPEE - Solar </title>
      </Helmet>

      <AppView />
    </>
  );
}
