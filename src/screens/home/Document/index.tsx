import React from 'react';
import Outgoing from '../Outgoing';
import Incoming from '../Incoming';
import DocumentCategoryManager from '../DocumentCategory/DocumentCategoryManager';
import DocumentStatistic from '../DocumentStatistic';

export default function Document(props: any) {
  const menuKey = props?.route?.params?.menuKey;

  if (menuKey === 'incomingDocument') {
    return <Incoming {...props} />;
  }

  if (menuKey === 'documentManagement') {
    return <DocumentCategoryManager {...props} />;
  }

  if (menuKey === 'documentStatistic') {
    return <DocumentStatistic {...props} />;
  }

  return <Outgoing {...props} />;
}
