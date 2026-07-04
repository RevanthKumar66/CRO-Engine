import React from 'react';
import { Container } from '../common/Container';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-muted bg-bg-primary/50 py-6">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Shopify CRO Opportunity Engine. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-text-muted">
            <span>Production Version 0.1.0</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
export default Footer;
