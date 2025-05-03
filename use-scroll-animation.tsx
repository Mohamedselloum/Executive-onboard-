import { useEffect, useRef } from 'react';

interface ScrollAnimationOptions {
  root?: Element | null;
  threshold?: number;
  rootMargin?: string;
  animationClass?: string;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animationClass = 'appear'
  } = options;
  
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(animationClass);
            // Once the animation is triggered, we can stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: options.root || null,
        rootMargin,
        threshold,
      }
    );
    
    const currentRef = ref.current;
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, animationClass, options.root]);
  
  return ref;
}