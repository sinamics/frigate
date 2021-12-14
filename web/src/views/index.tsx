export const getCameraMap = async (url, cb, props) => {
  const module = await import('./CameraMap.jsx');
  return module.default;
};

export const getCamera = async (url, cb, props) => {
  const module = await import('./Camera.jsx');
  return module.default;
};

export const getCameras = async (url, cb, props) => {
  const module = await import('./Cameras.jsx');
  return module.default;
};

export const getEvent = async (url, cb, props) => {
  const module = await import('./Event.jsx');
  return module.default;
};

export const getBirdseye = async (url, cb, props) => {
  const module = await import('./Birdseye.jsx');
  return module.default;
};

<<<<<<< HEAD:web/src/views/index.tsx
export const getEvents = async (url, cb, props) => {
  const module = await import('./Events.jsx');
=======
export async function getEvents(url, cb, props) {
  const module = await import('./Events');
>>>>>>> release-0.10.0:web/src/routes/index.js
  return module.default;
};

export const getRecording = async (url, cb, props) => {
  const module = await import('./Recording.jsx');
  return module.default;
};

export const getDebug = async (url, cb, props) => {
  const module = await import('./Debug.jsx');
  return module.default;
};

export const getStyleGuide = async (url, cb, props) => {
  const module = await import('./StyleGuide.jsx');
  return module.default;
};
