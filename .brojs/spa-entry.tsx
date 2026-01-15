import React from 'react';
import ReactDOM from 'react-dom/client';
import * as EntryModule from '../src/index.tsx';

const EntryComponent = EntryModule.default ?? (() => null);

const bootstrap = () => {
  const container = document.getElementById('app');

  if (!container) {
    throw new Error('Не найден элемент с id "app" для SPA-компиляции');
  }

  if (typeof EntryModule.mount === 'function') {
    EntryModule.mount(EntryComponent, container);
    return;
  }

  const root = ReactDOM.createRoot(container);
  root.render(<EntryComponent />);
};

bootstrap();
