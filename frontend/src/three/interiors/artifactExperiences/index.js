import {
  createCaptainsLogExperience,
  getLogExperienceCamera,
  animateCaptainsLogExperience,
  isLogExperienceComplete,
} from './captainsLogExperience.js'

const EXPERIENCES = {
  'captains-log': {
    create: createCaptainsLogExperience,
    getCamera: getLogExperienceCamera,
    animate: animateCaptainsLogExperience,
    isComplete: isLogExperienceComplete,
    route: '/captains-cabin/welcome-aboard-me-hearties',
    title: "Captain's Log",
    enterHint: 'The log beckons...',
    completeHint: 'Open the full Captain\'s Log',
  },
}

export function getArtifactExperience(type) {
  return EXPERIENCES[type] ?? null
}

export function getArtifactTypes() {
  return Object.keys(EXPERIENCES)
}

export { createCaptainsLogArtifact, createCaptainsLogDeskSign } from './captainsLogExperience.js'
export {
  findRoomArtifact,
  mountArtifactExperience,
  hideRoomForExperience,
  restoreRoomVisibility,
  createCameraTransition,
  updateCameraTransition,
  computeExperienceCameraWorld,
  flyCameraOut,
} from './artifactManager.js'
