'use client';

import { useState } from 'react';

export function useYearNavigation(initialYear: number = 2025) {
  const [currentYear, setCurrentYear] = useState(initialYear);

  const handlePreviousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  return {
    currentYear,
    handlePreviousYear,
    handleNextYear,
  };
}

