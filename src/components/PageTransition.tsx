
import React, { ReactNode } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

interface PageTransitionProps {
  children: ReactNode;
  location: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, location }) => {
  return (
    <TransitionGroup className="w-full h-full">
      <CSSTransition
        key={location}
        timeout={300}
        classNames="page-transition"
        unmountOnExit
      >
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

export default PageTransition;
