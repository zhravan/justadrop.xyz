import * as React from 'react';
import { Button } from '../ui/button';

interface HeaderProps {
  title?: string;
  logo?: React.ReactNode;
  nav?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({ 
  title = 'juztadrop', 
  logo,
  nav,
  children 
}: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          {logo || <h1 className="text-lg font-semibold">{title}</h1>}
        </div>
        <nav className="flex flex-1 items-center justify-end space-x-2">
          {nav || children}
        </nav>
      </div>
    </header>
  );
}
