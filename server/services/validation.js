const VALID_TRANSITIONS = {
  draft: ['pending_review'],
  pending_review: ['approved', 'rejected', 'draft'],
  approved: ['scheduled', 'draft'],
  rejected: ['draft'],
  scheduled: ['published', 'approved'],
  published: [],
};

const PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'];
const STATUSES = ['draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'published'];
const ROLES = ['admin', 'content_creator', 'reviewer'];

function canTransition(fromStatus, toStatus) {
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

function isValidPlatform(platform) {
  return PLATFORMS.includes(platform);
}

function isValidStatus(status) {
  return STATUSES.includes(status);
}

function isValidRole(role) {
  return ROLES.includes(role);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 8;
}

function validateContentData(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 255) {
      errors.push('Title must be 255 characters or less');
    }
  }

  if (!isUpdate || data.caption !== undefined) {
    if (!data.caption || data.caption.trim().length === 0) {
      errors.push('Caption is required');
    }
  }

  if (!isUpdate || data.platform !== undefined) {
    if (!data.platform) {
      errors.push('Platform is required');
    } else if (!isValidPlatform(data.platform)) {
      errors.push(`Invalid platform. Must be one of: ${PLATFORMS.join(', ')}`);
    }
  }

  if (data.status !== undefined && !isValidStatus(data.status)) {
    errors.push(`Invalid status. Must be one of: ${STATUSES.join(', ')}`);
  }

  return errors;
}

module.exports = {
  VALID_TRANSITIONS,
  PLATFORMS,
  STATUSES,
  ROLES,
  canTransition,
  isValidPlatform,
  isValidStatus,
  isValidRole,
  validateEmail,
  validatePassword,
  validateContentData,
};
