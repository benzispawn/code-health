export type Rating =
  | 'Excellent'
  | 'Good'
  | 'Medium'
  | 'Bad'
  | 'Extreme Bad'
  | 'Unknown';

const COLORS: Record<Exclude<Rating, 'Unknown'>, string> = {
  Excellent: '\u001b[32m',
  Good: '\u001b[32m',
  Medium: '\u001b[33m',
  Bad: '\u001b[31m',
  'Extreme Bad': '\u001b[91m',
};

const RESET = '\u001b[0m';

export function formatRating(rating: Rating): string {
  if (rating === 'Unknown') {
    return '(not available)';
  }

  return `(${COLORS[rating]}${rating}${RESET})`;
}

export function rateScore(value: number): Rating {
  if (value >= 90) {
    return 'Excellent';
  }
  if (value >= 80) {
    return 'Good';
  }
  if (value >= 60) {
    return 'Medium';
  }
  if (value >= 40) {
    return 'Bad';
  }
  return 'Extreme Bad';
}

export function rateCoverage(value: number | undefined): Rating {
  return value === undefined ? 'Unknown' : rateScore(value);
}

export function rateDuplication(value: number): Rating {
  if (value <= 2) {
    return 'Excellent';
  }
  if (value <= 5) {
    return 'Good';
  }
  if (value <= 10) {
    return 'Medium';
  }
  if (value <= 20) {
    return 'Bad';
  }
  return 'Extreme Bad';
}

export function rateDependencyDepth(value: number): Rating {
  if (value <= 2) {
    return 'Excellent';
  }
  if (value <= 4) {
    return 'Good';
  }
  if (value <= 8) {
    return 'Medium';
  }
  if (value <= 12) {
    return 'Bad';
  }
  return 'Extreme Bad';
}

export function rateApiSurface(value: number): Rating {
  if (value <= 25) {
    return 'Excellent';
  }
  if (value <= 75) {
    return 'Good';
  }
  if (value <= 150) {
    return 'Medium';
  }
  if (value <= 300) {
    return 'Bad';
  }
  return 'Extreme Bad';
}

export function ratePublicExports(value: number): Rating {
  if (value <= 20) {
    return 'Excellent';
  }
  if (value <= 50) {
    return 'Good';
  }
  if (value <= 100) {
    return 'Medium';
  }
  if (value <= 200) {
    return 'Bad';
  }
  return 'Extreme Bad';
}

export function rateControllerCount(value: number): Rating {
  if (value <= 10) {
    return 'Excellent';
  }
  if (value <= 25) {
    return 'Good';
  }
  if (value <= 50) {
    return 'Medium';
  }
  if (value <= 100) {
    return 'Bad';
  }
  return 'Extreme Bad';
}

export function rateEndpointCount(value: number): Rating {
  if (value <= 30) {
    return 'Excellent';
  }
  if (value <= 100) {
    return 'Good';
  }
  if (value <= 200) {
    return 'Medium';
  }
  if (value <= 400) {
    return 'Bad';
  }
  return 'Extreme Bad';
}

export function ratePackageCycles(value: number): Rating {
  if (value === 0) {
    return 'Excellent';
  }
  if (value === 1) {
    return 'Bad';
  }
  return 'Extreme Bad';
}
