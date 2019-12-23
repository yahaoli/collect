import React from 'react';
import PageLoading from '@/components/PageLoading/PageLoading';

export default function asyncComponent(importComponent) {
  class AsyncComponent extends React.Component {
    render() {
      const C = React.lazy(importComponent);
      return (
        <React.Suspense fallback={<PageLoading/>}>
          <C/>
        </React.Suspense>
      );
    }
  }

  return AsyncComponent;
}
