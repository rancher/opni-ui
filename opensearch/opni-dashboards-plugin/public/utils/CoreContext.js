import React from 'react';

const CoreContext = React.createContext({});

const CoreConsumer = CoreContext.Consumer;

export { CoreContext, CoreConsumer };
