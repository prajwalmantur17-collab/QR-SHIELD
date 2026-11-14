import { useEffect } from 'react';

/**
 * Custom hook to update the document title
 * Format: "<Page> | QR Shield"
 */
export default function usePageTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) {
      document.title = `${title} | QR Shield`;
    }
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
