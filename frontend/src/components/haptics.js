export const triggerVibration = (type = 'success') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  const isHapticsEnabled = localStorage.getItem('hapticsEnabled');
  if (isHapticsEnabled === 'false') return; 

  switch (type) {
    case 'success':
      navigator.vibrate(50); 
      break;
    case 'error':
      navigator.vibrate([100, 50, 100]); 
      break;
    case 'warning':
      navigator.vibrate(200); 
      break;
    default:
      navigator.vibrate(50);
  }
};