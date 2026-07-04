import React from 'react';
import { Container } from '../common/Container';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-muted bg-bg-primary/50 py-6">
      <Container>
        <div className="flex flex-row items-center justify-between text-[10px] sm:text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} CRO Engine.</p>
          <p>v0.1.0</p>
        </div>
      </Container>
    </footer>
  );
};
export default Footer;
